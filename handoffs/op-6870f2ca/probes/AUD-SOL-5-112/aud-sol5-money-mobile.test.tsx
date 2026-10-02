import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
const mockGet = jest.fn();
jest.mock('/home/user/workspace/wt/aud-sol5-332/src/services/api', () => ({
  __esModule: true,
  default: { get: (...args: unknown[]) => mockGet(...args), post: jest.fn() },
}));
jest.mock('/home/user/workspace/wt/aud-sol5-332/src/services/sentry', () => ({ captureError: jest.fn() }));
jest.mock('/home/user/workspace/wt/aud-sol5-332/src/hooks/useNetworkStatus', () => ({
  useNetworkStatus: () => ({ isOnline: true, isInternetReachable: true }),
}));
jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn() }));
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn(), canGoBack: () => true, goBack: jest.fn(), getParent: () => undefined }),
}));
import { toSummary } from '/home/user/workspace/wt/aud-sol5-332/src/api/coachMoneyApi';
import MoneyScreen from '/home/user/workspace/wt/aud-sol5-332/src/screens/coach/money/MoneyScreen';
import MoneyChargeScreen from '/home/user/workspace/wt/aud-sol5-332/src/screens/coach/money/MoneyChargeScreen';
const SUMMARY = {
  currency: 'usd', window: { from: '2026-09-02T00:00:00Z', to: '2026-10-02T00:00:00Z' },
  totals: { gross_cents: 10000, processing_cents: 320, platform_fee_cents: 200, head_coach_split_cents: 0,
    refunded_cents: 0, head_coach_income_cents: 0, net_cents: 9480, charge_count: 1, processing_paid_by: 'coach' },
  recurring: { mrr_cents: 4000, paying_clients: 1, churned_30d: 0, new_clients_30d: 0 },
  change_cents: 4740, change_pct: 100, attention_count: 0, generated_at: '2026-10-02T00:00:00Z',
};
beforeEach(() => mockGet.mockReset());
test('B-332-1: failed Today fetch must not relabel cached 30-day money as Today', async () => {
  let summaryCalls = 0;
  mockGet.mockImplementation(async (url: string) => {
    if (url === '/v1/coach/money/summary') {
      summaryCalls += 1;
      if (summaryCalls > 1) throw Object.assign(new Error('server failed'), { response: { status: 500, data: { request_id: 'range-ref' } } });
      return { data: SUMMARY };
    }
    if (url === '/coach/connect/status') return { data: { account_id: 'a', state: 'active', charges_enabled: true, payouts_enabled: true } };
    if (url.endsWith('/attention')) return { data: { count: 0, items: [] } };
    if (url.endsWith('/charges')) return { data: { charges: [] } };
    if (url.endsWith('/payouts')) return { data: [] };
    return { data: {} };
  });
  const screen = await render(<MoneyScreen />);
  await screen.findByTestId('money-net-amount');
  await fireEvent.press(screen.getByTestId('money-range-today'));
  await waitFor(() => expect(summaryCalls).toBe(2));
  console.log('range failure', {
    amount: screen.getByTestId('money-net-amount').props.children,
    label: screen.getByTestId('money-net-toggle').props.accessibilityLabel,
    errorVisible: !!screen.queryByTestId('money-summary-error'),
  });
  expect(screen.queryByTestId('money-summary-error')).not.toBeNull();
});
test('B-332-2: recurring alone must not claim Monthly cadence', async () => {
  mockGet.mockResolvedValue({ data: {
    charge: { id: 'c', client: { id: 'u', name: 'Dana' }, package: { name: 'Quarterly' }, amount_cents: 12000,
      currency: 'usd', billing_type: 'recurring', state: 'paid', refunded_cents: 0, created_at: '2026-10-02T00:00:00Z' },
    breakdown: { price_cents: 12000, processing_cents: 400, platform_fee_cents: 240, head_coach_split_cents: 0,
      refunded_cents: 0, net_cents: 11360, processing_paid_by: 'coach', settled: true },
  } });
  const screen = await render(<MoneyChargeScreen navigation={{ getParent: () => undefined } as never}
    route={{ params: { chargeId: 'c' } } as never} />);
  await screen.findByTestId('money-charge-breakdown');
  const monthly = screen.queryAllByText(/Quarterly, Monthly/);
  console.log('quarterly charge rendered as monthly', monthly.length);
  expect(monthly).toHaveLength(0);
});
test('B-332-3: missing required money fields must fail closed instead of inventing USD zero', () => {
  const bad = { totals: {}, recurring: {} };
  console.log('malformed summary', toSummary(bad));
  expect(() => toSummary(bad)).toThrow();
});
