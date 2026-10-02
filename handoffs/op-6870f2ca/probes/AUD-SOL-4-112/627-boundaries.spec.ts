// Audit-only acceptance probes. No real database, Stripe, push or email.
import { ConfigService } from '@nestjs/config';
import { Prisma, type ClientPurchase } from '@prisma/client';
import { PayoutNoticeService } from '../src/checkout/payout-notice.service';
import { RefundDisputeHandlerService } from '../src/checkout/refund-dispute-handler.service';
import { ChargeSettlementService, adjustmentNoticeAmounts } from '../src/connect/fees/charge-settlement.service';
import { payoutNoticeCopy } from '../src/connect/fees/payout-notice-copy';
import { FeePolicyService } from '../src/connect/fees/fee-policy.service';
import { SplitLedgerService } from '../src/connect/fees/split-ledger.service';
import { TransferOrchestratorService } from '../src/connect/fees/transfer-orchestrator.service';
import { EmailService } from '../src/email/email.service';
import type { NotificationsService } from '../src/notifications/notifications.service';
import type { PayoutReadinessService } from '../src/connect/fees/payout-readiness.service';
import { asPrisma, FakeStripe, makeCharge, makeSettlementPrisma, Table, type Row } from './utils/settlement-fakes';

const asNotifications = (value: object): NotificationsService => value as NotificationsService;

function setup() {
  const { prisma, db } = makeSettlementPrisma();
  const logRows: Row[] = [];
  const logs = new Table(logRows, { unique: ['idempotency_key'], prefix: 'email' });
  const originalCreate = logs.create.getMockImplementation()!;
  logs.create.mockImplementation(async (args) => {
    if (logRows.some(r => r.idempotency_key === args.data.idempotency_key)) {
      throw new Prisma.PrismaClientKnownRequestError('duplicate', { code: 'P2002', clientVersion: 'test' });
    }
    return originalCreate(args);
  });
  const p = Object.assign(prisma, {
    user: new Table([{ id: 'coach-1', name: 'Coach', email: 'coach@example.invalid' }], {prefix:'user'}),
    emailSendLog: logs,
  });
  const stripe = new FakeStripe();
  const ledger = new SplitLedgerService(asPrisma(p));
  const transfers = new TransferOrchestratorService(asPrisma(p), stripe, ledger);
  const svc = new ChargeSettlementService(asPrisma(p), stripe, new FeePolicyService(asPrisma(p)), ledger, transfers);
  db.accounts.push({ coach_user_id: 'coach-1', stripe_account_id: 'acct_coach' });
  const purchase = {
    id: 'purchase-1', coach_user_id: 'coach-1', client_user_id: 'client-1',
    package_id: 'package-1', amount_cents: 10000, currency: 'usd',
    billing_type: 'one_time', status: 'paid', entitlement_active: true,
    stripe_payment_intent_id: 'pi_ch_1', source: null, created_at: new Date(),
  } as ClientPurchase;
  db.purchases.push(purchase as Row);
  const notifications = {
    createNotification: jest.fn(async () => ({ id: 'n1' })),
    pushToUser: jest.fn(async () => ({ delivered: true, code: 'delivered' })),
  };
  const email = new EmailService(asPrisma(p), new ConfigService({ EMAIL_TRANSPORT: 'log' }));
  const notices = new PayoutNoticeService(asPrisma(p), asNotifications(notifications), email);
  const handler = new RefundDisputeHandlerService(
    asPrisma(p), stripe, ledger, transfers, {} as PayoutReadinessService,
    asNotifications(notifications), undefined, undefined, svc, notices,
  );
  const sell = async () => {
    stripe.charges.set('ch_1', makeCharge({id: 'ch_1', amount: 10000, fee: 320}));
    await svc.settleCharge({ purchase, charge_id: 'ch_1' });
  };
  const refund = async (cents: number) => {
    stripe.charges.get('ch_1')!.amount_refunded = cents;
    await svc.applyAdjustments({ purchase, charge_id: 'ch_1', refunded_cents: cents });
  };
  return { p, db, stripe, transfers, svc, purchase, notifications, email, notices, handler, sell, refund, logRows };
}

it('B-627-6: failed real EmailService send must actually retry, without repeating completed push', async () => {
  const c = setup();
  await c.sell();
  await c.refund(10000);
  jest.spyOn(c.email, 'render').mockImplementationOnce(() => { throw new Error('temporary render failure'); });
  await c.notices.dispatchForCharge('ch_1');
  expect(c.logRows[0].status).toBe('failed');
  await c.notices.dispatchPending(new Date(Date.now() + 10 * 60000));
  expect(c.logRows.some(r => r.status === 'logged' || r.status === 'sent')).toBe(true);
  expect(c.notifications.pushToUser).toHaveBeenCalledTimes(1);
});

it('B-627-6: a returned push failure must leave a notice retryable', async () => {
  const c = setup();
  await c.sell();
  await c.refund(10000);
  c.notifications.pushToUser.mockResolvedValue({ delivered: false, code: 'provider-error' });
  await c.notices.dispatchForCharge('ch_1');
  expect(c.db.notices![0].push_status).toBe('failed');
  expect(c.db.notices![0].dispatched_at).toBeNull();
});

it('B-627-5: unknown lookup of a previously-sent reversal must not resend', async () => {
  const c = setup();
  await c.sell();
  c.stripe.reversalResponsesLost = 1;
  c.stripe.failListReversals = true;
  await expect(c.refund(2000)).rejects.toThrow('SFEE_REVERSAL_UNCERTAIN');
  expect(c.stripe.reverseTransfer).toHaveBeenCalledTimes(1);
  await expect(c.refund(2000)).rejects.toThrow('SFEE_REVERSAL_UNCERTAIN');
  expect(c.stripe.reverseTransfer).toHaveBeenCalledTimes(1);
});

it('OR-111-2: closed-first lost dispute must recover money and revoke entitlement', async () => {
  const c = setup();
  await c.sell();
  c.stripe.disputes.set('dp_closed_first', {
    id: 'dp_closed_first', balance_transactions: [{ id: 'bt1', amount: -10000, fee: 1500 }],
  });
  await c.handler.handle({
    id: 'evt_closed_first', type: 'charge.dispute.closed',
    data: {object: {id: 'dp_closed_first', charge: 'ch_1', status: 'lost', amount: 10000,
      balance_transactions: [{id:'bt1', amount:-10000, fee:1500}]}},
  });
  expect(c.db.purchases[0].entitlement_active).toBe(false);
  expect(c.db.settlements[0].dispute_withdrawn_cents).toBe(10000);
});

it('B-627-7: refund notice must announce only the hold still to be taken, not already collected cents', () => {
  const amounts = adjustmentNoticeAmounts({
    leg: { leg: 'coach', target_cents: -520 },
    split: { gross_cents: 10000, stripe_fee_cents: 320, platform_fee_cents: 200 },
    adj: { refunded_cents: 10000, dispute_withdrawn_cents: 0, dispute_fee_cents: 0 },
    currency: 'usd',
    transfers: [],
    recoveries: [
      { status: 'collected', amount_cents: 420, collected_cents: 420 },
      { status: 'open', amount_cents: 100, collected_cents: 0 },
    ],
    previous_held_cents: 420,
  });
  expect(amounts.held_open_cents).toBe(100);
  expect(payoutNoticeCopy('refund', 'coach', amounts).body).toContain('We will hold $1.00 from your next sale.');
});
