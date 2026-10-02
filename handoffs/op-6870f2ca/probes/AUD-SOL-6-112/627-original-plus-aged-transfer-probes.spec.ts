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
import { NotificationsService } from '../src/notifications/notifications.service';
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

it('C-627-8: committed inbox write can repeat if its separate notice receipt write fails', async () => {
  const c = setup();
  const inboxRows: Row[] = [];
  const p = Object.assign(c.p, {
    notification: new Table(inboxRows, { prefix: 'notification' }),
    notificationPreferences: new Table([], { prefix: 'preferences' }),
  });
  const notifications = new NotificationsService(asPrisma(p));
  jest.spyOn(notifications, 'pushToUser').mockResolvedValue({ delivered: true, code: 'delivered' });
  const notices = new PayoutNoticeService(asPrisma(p), notifications, c.email);
  await c.sell();
  await c.refund(10000);
  const update = p.payoutAdjustmentNotice.updateMany.getMockImplementation()!;
  let receiptFailed = false;
  p.payoutAdjustmentNotice.updateMany.mockImplementation(async (args) => {
    if (!receiptFailed && args.data.inapp_status === 'sent') {
      receiptFailed = true;
      throw new Prisma.PrismaClientKnownRequestError('receipt connection unavailable', {
        code: 'P2024',
        clientVersion: 'audit',
      });
    }
    return update(args);
  });
  await expect(notices.dispatchForCharge('ch_1')).rejects.toThrow('receipt connection unavailable');
  expect(inboxRows.filter(r => r.channel === 'inapp')).toHaveLength(1);
  expect(c.db.notices![0].inapp_status).toBe('pending');
  await notices.dispatchPending(new Date(Date.now() + 10 * 60000));
  expect(inboxRows.filter(r => r.channel === 'inapp')).toHaveLength(2);
  expect(c.db.notices![0].inapp_status).toBe('sent');
  expect(c.db.notices![0].dispatched_at).not.toBeNull();
  // This is an optional at-least-once notification boundary, not duplicate money.
  expect(c.stripe.reverseTransfer).toHaveBeenCalledTimes(1);
});

it.each([
  { lost: 'response', expired: true },
  { lost: 'receipt', expired: true },
  { lost: 'response', expired: false },
  { lost: 'receipt', expired: false },
] as const)(
  'B-627-8: uncertain reinstatement after $lost loss; key expired=$expired',
  async ({ lost, expired }) => {
    const c = setup();
    await c.sell();
    await c.svc.applyAdjustments({
      purchase: c.purchase,
      charge_id: 'ch_1',
      dispute: { withdrawn_cents: 10000, fee_cents: 1500 },
    });
    type ExternalTransfer = {
      id: string;
      amount: number;
      destination: string;
      source_transaction?: string;
      currency: string;
    };
    const durable: ExternalTransfer[] = [];
    const keyCache = new Map<string, ExternalTransfer>();
    let loseResponse = lost === 'response';
    c.stripe.createTransfer.mockImplementation(async args => {
      const previous = keyCache.get(args.idempotencyKey);
      if (previous) return previous;
      const created: ExternalTransfer = {
        id: `aged-transfer-${durable.length + 1}`,
        amount: args.amount,
        destination: args.destination,
        source_transaction: args.source_transaction,
        currency: 'usd',
      };
      durable.push(created);
      keyCache.set(args.idempotencyKey, created);
      if (loseResponse) {
        loseResponse = false;
        throw new Error('socket closed after transfer execution');
      }
      return created;
    });
    const update = c.p.connectTransfer.update.getMockImplementation()!;
    let loseReceipt = lost === 'receipt';
    c.p.connectTransfer.update.mockImplementation(async args => {
      if (loseReceipt && args.data.status === 'succeeded') {
        loseReceipt = false;
        throw new Prisma.PrismaClientKnownRequestError('transfer receipt connection unavailable', {
          code: 'P2024',
          clientVersion: 'audit',
        });
      }
      return update(args);
    });
    await c.svc.applyAdjustments({
      purchase: c.purchase,
      charge_id: 'ch_1',
      dispute: { withdrawn_cents: 0, fee_cents: 0 },
    });
    const reinstatement = c.db.transfers.find(r => r.kind === 'coach_reinstate')!;
    expect(reinstatement.status).toBe('pending');
    expect(reinstatement.stripe_transfer_id).toBeNull();
    expect(durable).toHaveLength(1);
    expect(durable[0].source_transaction).toBeUndefined();
    expect(durable[0].amount).toBe(9480);
    // Stripe's durable transfer survives, but the request-key cache may be
    // pruned after 24 hours. A sweeper delayed 25 hours sees the same due row.
    if (expired) keyCache.clear();
    const due = await c.transfers.findDueTransfers(
      new Date(Date.now() + (expired ? 25 * 3600000 : 6 * 60000)),
    );
    expect(due.some(r => r.id === reinstatement.id)).toBe(true);
    await c.transfers.attempt(reinstatement.id);
    expect(durable).toHaveLength(expired ? 2 : 1);
    expect(durable.reduce((sum, r) => sum + r.amount, 0)).toBe(expired ? 18960 : 9480);
    expect(reinstatement.amount_cents).toBe(9480);
    expect(reinstatement.status).toBe('succeeded');
    // Both attempts used one logical operation's exact same request key.
    expect(c.stripe.createTransfer.mock.calls.slice(-2).map(([args]) => args.idempotencyKey))
      .toEqual([reinstatement.idempotency_key, reinstatement.idempotency_key]);
  },
);
