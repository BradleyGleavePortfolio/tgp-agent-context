import { CoachMoneyService } from '/home/user/workspace/wt/aud-sol5-641/src/coach-money/coach-money.service';

function slice(currency: string, purchase: string) {
  return {
    kind: 'destination', payee_user_id: 'coach', amount_cents: 9800,
    reversed_cents: 0, status: 'posted', purchase_id: purchase, currency,
  };
}

function harness(active: object[] = [], slices: object[] = []) {
  const p = {
    splitLedgerEntry: {
      findMany: jest.fn(async (a) => a.where.kind === 'head_coach_split' ? [] : slices),
    },
    clientPurchase: {
      findMany: jest.fn(async (a) => a.where.entitlement_active ? active : []),
    },
    chargeDispute: { findMany: jest.fn(async () => []) },
    connectAccount: { findUnique: jest.fn(async () => null) },
  };
  const service: CoachMoneyService = Reflect.construct(CoachMoneyService, [p]);
  return { p, service };
}

const window = { from: new Date('2026-09-02Z'), to: new Date('2026-10-02Z') };

test('B-641-3: mixed currencies must not be added and labelled USD', async () => {
  const { service } = harness([], [slice('usd', 'p-usd'), slice('eur', 'p-eur')]);
  const out = await service.getSummary('coach', window, null);
  console.log('mixed-currency summary', out.currency, out.totals.net_cents);
  expect(out.currency === 'usd' && out.totals.net_cents === 19600).toBe(false);
});

test('B-641-4: a USD 120 quarterly subscription is USD 40 MRR, not USD 120', async () => {
  const { service } = harness([{
    client_user_id: 'client', amount_cents: 12000, currency: 'usd',
    billing_type: 'recurring', package: { interval: 'month', interval_count: 3 },
  }]);
  const out = await service.getSummary('coach', window, null);
  console.log('quarterly summary', out.recurring);
  expect(out.recurring.mrr_cents).toBe(4000);
});
