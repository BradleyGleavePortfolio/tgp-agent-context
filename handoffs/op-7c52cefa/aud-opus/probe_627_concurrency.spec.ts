// S-FEE — coach payout fee math, end to end against in-memory fakes.
//
// Mechanism under test: separate charges and transfers with on_behalf_of.
// The platform charges the client the listed price, reads Stripe's ACTUAL
// fee from the charge's balance transaction, and transfers
//   coach_net = gross - stripe_fee - TGP 2% (- head-coach split)
// with source_transaction = the charge. TGP keeps exactly its fee, so the
// platform net of every charge is >= 0, including after refunds and disputes
// (what a transfer reversal cannot recover becomes a PayeeRecovery netted
// from the coach's next payout).
//
// No live Stripe calls: FakeStripe returns objects shaped like real Stripe
// Charge / BalanceTransaction / Transfer / TransferReversal objects.
import type {
  ChargeSettlement,
  ClientPurchase,
  ConnectTransfer,
  PayeeRecovery,
  SplitLedgerEntry,
} from '@prisma/client';
import { ChargeSettlementService } from '../src/connect/fees/charge-settlement.service';
import { coachNetCents } from '../src/connect/fees/coach-net';
import { FeePolicyService } from '../src/connect/fees/fee-policy.service';
import { settlementIdentityDrift } from '../src/connect/fees/reconciliation.service';
import { SplitLedgerService } from '../src/connect/fees/split-ledger.service';
import { TransferOrchestratorService } from '../src/connect/fees/transfer-orchestrator.service';
import { computeAdjustedTargets, computeChargeSplit } from '../src/payouts-v2/platform-fee.service';
import {
  FakeStripe,
  asPrisma,
  intlCardFeeCents,
  makeCharge,
  makeSettlementPrisma,
  usCardFeeCents,
  type Row,
} from './utils/settlement-fakes';

const COACH = 'coach-1';
const HEAD = 'head-1';

function purchaseRow(overrides: Partial<ClientPurchase> = {}): ClientPurchase {
  const base: Row = {
    id: 'cp-1',
    coach_user_id: COACH,
    client_user_id: 'client-1',
    package_id: 'pkg-1',
    amount_cents: 4_900,
    currency: 'usd',
    billing_type: 'recurring',
    status: 'active',
    source: null,
    stripe_payment_intent_id: null,
    stripe_subscription_id: 'sub_1',
    created_at: new Date('2026-10-01T12:00:00Z'),
    ...overrides,
  };
  return base as ClientPurchase;
}

function setup(opts: { headCoach?: boolean; headCoachAccount?: boolean } = {}) {
  const { prisma, db } = makeSettlementPrisma();
  const stripe = new FakeStripe();
  const feePolicy = new FeePolicyService(asPrisma(prisma));
  const ledger = new SplitLedgerService(asPrisma(prisma));
  const transfers = new TransferOrchestratorService(asPrisma(prisma), stripe, ledger);
  const svc = new ChargeSettlementService(asPrisma(prisma), stripe, feePolicy, ledger, transfers);
  db.accounts.push({ coach_user_id: COACH, stripe_account_id: 'acct_coach' });
  if (opts.headCoach) {
    db.assignments.push({
      sub_coach_id: COACH,
      head_coach_id: HEAD,
      archived_at: null,
      created_at: new Date('2026-01-01T00:00:00Z'),
    });
    if (opts.headCoachAccount !== false) {
      db.accounts.push({ coach_user_id: HEAD, stripe_account_id: 'acct_head' });
    }
  }
  const purchase = purchaseRow();
  db.purchases.push(purchase as Row);

  const settlementFor = (chargeId: string) =>
    db.settlements.find((s) => s.stripe_charge_id === chargeId)!;
  // Reconciliation identity for one charge (drift must be 0).
  const identity = (chargeId: string) => {
    const s = settlementFor(chargeId);
    const charge = stripe.charges.get(chargeId)!;
    const bt = charge.balance_transaction as { amount: number; fee: number };
    return settlementIdentityDrift({
      settlement: s as ChargeSettlement,
      ledger: db.ledger as SplitLedgerEntry[],
      transfers: db.transfers.filter((t) => t.settlement_id === s.id) as ConnectTransfer[],
      recoveries: db.recoveries.filter((r) => r.settlement_id === s.id) as PayeeRecovery[],
      stripe: {
        gross_cents: bt.amount,
        fee_cents: bt.fee,
        refunded_cents: charge.amount_refunded ?? 0,
      },
    });
  };
  return { prisma, db, stripe, svc, purchase, settlementFor, identity };
}


describe('AUD-OPUS probe: concurrent adjustments on one charge', () => {
  it('two different refund states processed concurrently', async () => {
    const { svc, stripe, db, purchase } = setup();
    stripe.charges.set('ch_1', makeCharge({ id: 'ch_1', amount: 4_900, fee: 172 }));
    await svc.settleCharge({ purchase, charge_id: 'ch_1' });
    stripe.charges.set('ch_1', makeCharge({ id: 'ch_1', amount: 4_900, fee: 172, amount_refunded: 3_000 }));
    await Promise.all([
      svc.applyAdjustments({ purchase, charge_id: 'ch_1', refunded_cents: 2_000 }),
      svc.applyAdjustments({ purchase, charge_id: 'ch_1', refunded_cents: 3_000 }),
    ]);
    const open = db.recoveries.filter((r) => r.status === 'open').reduce((n, r) => n + (r.amount_cents - r.collected_cents), 0);
    const s = db.settlements.find((x) => x.stripe_charge_id === 'ch_1')!;
    const dbRev = db.transfers.reduce((n, t) => n + (t.reversed_amount_cents ?? 0), 0);
    // eslint-disable-next-line no-console
    console.log('PROBE distinct', JSON.stringify({ target: s.target_coach_net_cents, stripeNet: stripe.netTo('acct_coach'), openRecoveries: open, reversals: [...stripe.reversalsByKey.values()].map((r) => r.amount), dbReversed: dbRev }));
  });
  it('the same refund state delivered twice concurrently', async () => {
    const { svc, stripe, db, purchase } = setup();
    stripe.charges.set('ch_1', makeCharge({ id: 'ch_1', amount: 4_900, fee: 172 }));
    await svc.settleCharge({ purchase, charge_id: 'ch_1' });
    stripe.charges.set('ch_1', makeCharge({ id: 'ch_1', amount: 4_900, fee: 172, amount_refunded: 2_000 }));
    await Promise.all([
      svc.applyAdjustments({ purchase, charge_id: 'ch_1', refunded_cents: 2_000 }),
      svc.applyAdjustments({ purchase, charge_id: 'ch_1', refunded_cents: 2_000 }),
    ]);
    const s = db.settlements.find((x) => x.stripe_charge_id === 'ch_1')!;
    const dest = db.ledger.filter((e) => e.kind === 'destination').map((e) => ({ amount: e.amount_cents, reversed: e.reversed_cents }));
    // eslint-disable-next-line no-console
    console.log('PROBE duplicate', JSON.stringify({ target: s.target_coach_net_cents, stripeNet: stripe.netTo('acct_coach'), reversals: [...stripe.reversalsByKey.values()].map((r) => r.amount), ledgerDestination: dest }));
  });
});
