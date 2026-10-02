/**
 * S-COACH-MOB-2 — TGP Money: typed client, copy, Home card, Money page,
 * charges list, charge breakdown, redirects. Every state: loading, empty
 * (no Stripe -> setup action), error with reference, offline.
 */
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";

const mockGet = jest.fn();
const mockPost = jest.fn();
jest.mock("/home/user/workspace/wt/aud-sol5-332/src/services/api", () => ({
  __esModule: true,
  default: {
    get: (...a: unknown[]) => mockGet(...a),
    post: (...a: unknown[]) => mockPost(...a),
  },
}));

jest.mock("/home/user/workspace/wt/aud-sol5-332/src/services/sentry", () => ({ captureError: jest.fn() }));

const mockOpenBrowser = jest.fn();
jest.mock("expo-web-browser", () => ({
  __esModule: true,
  openBrowserAsync: (...a: unknown[]) => mockOpenBrowser(...a),
}));

let mockOnline = true;
jest.mock("/home/user/workspace/wt/aud-sol5-332/src/hooks/useNetworkStatus", () => ({
  useNetworkStatus: () => ({
    isOnline: mockOnline,
    isInternetReachable: mockOnline,
  }),
}));

const mockNavigate = jest.fn();
const mockReplace = jest.fn();
const mockParentNavigate = jest.fn();
jest.mock("@react-navigation/native", () => {
  const actual = jest.requireActual("@react-navigation/native");
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
      replace: mockReplace,
      goBack: jest.fn(),
      canGoBack: () => true,
      getParent: () => ({ navigate: mockParentNavigate }),
    }),
    useFocusEffect: (cb: () => void) => {
      const R = jest.requireActual("react");
      R.useEffect(cb, [cb]);
    },
  };
});

import {
  nextPayout,
  toCharge,
  toPayout,
  toSummary,
  windowsFor,
  type AttentionItem,
} from "/home/user/workspace/wt/aud-sol5-332/src/api/coachMoneyApi";
import {
  attentionCopy,
  breakdownRows,
  changeLine,
  chargeStateLabel,
} from "/home/user/workspace/wt/aud-sol5-332/src/lib/money/moneyCopy";
import MoneyScreen from "/home/user/workspace/wt/aud-sol5-332/src/screens/coach/money/MoneyScreen";
import MoneyChargesScreen from "/home/user/workspace/wt/aud-sol5-332/src/screens/coach/money/MoneyChargesScreen";
import MoneyChargeScreen from "/home/user/workspace/wt/aud-sol5-332/src/screens/coach/money/MoneyChargeScreen";
import MoneyRedirect from "/home/user/workspace/wt/aud-sol5-332/src/screens/coach/money/MoneyRedirect";
import MoneyHomeCard from "/home/user/workspace/wt/aud-sol5-332/src/components/coach/money/MoneyHomeCard";

function httpError(status: number, data?: Record<string, unknown>) {
  return Object.assign(new Error(`HTTP ${status}`), {
    response: { status, data: data ?? {}, headers: {} },
  });
}

const totals = (over: Record<string, unknown> = {}) => ({
  gross_cents: 10000,
  processing_cents: 320,
  platform_fee_cents: 200,
  head_coach_split_cents: 0,
  refunded_cents: 0,
  head_coach_income_cents: 0,
  net_cents: 9480,
  charge_count: 2,
  processing_paid_by: "coach",
  ...over,
});

const SUMMARY = {
  currency: "usd",
  window: { from: "2026-09-02T00:00:00Z", to: "2026-10-02T00:00:00Z" },
  totals: totals(),
  compare_totals: totals({ net_cents: 4740 }),
  change_cents: 4740,
  change_pct: 100,
  recurring: {
    mrr_cents: 9800,
    paying_clients: 2,
    churned_30d: 1,
    new_clients_30d: 2,
  },
  attention_count: 2,
  generated_at: "2026-10-02T19:00:00Z",
};

const ATTENTION = {
  count: 2,
  items: [
    {
      kind: "failed_payment",
      id: "p1",
      client: { id: "u_sam", name: "Sam" },
      amount_cents: 4900,
      currency: "usd",
      created_at: "2026-10-01T00:00:00Z",
      failed_payment: {
        purchase_id: "p1",
        package_name: "North coaching",
        attempt: 2,
        max_attempts: 4,
        next_retry_at: "2026-10-04T00:00:00Z",
        locked_out_at: null,
        card_update_link_sent_at: null,
        last_failure_reason: "card_declined",
      },
    },
    {
      kind: "stripe_requirements",
      id: "acct",
      client: null,
      amount_cents: null,
      currency: null,
      created_at: null,
      stripe_requirements: {
        currently_due: ["external_account"],
        past_due: [],
        current_deadline: "2026-10-20T00:00:00Z",
        disabled_reason: null,
      },
    },
  ],
};

const CHARGES = {
  charges: [
    {
      id: "ch_1",
      client: { id: "u_sam", name: "Sam" },
      package: { id: "pk", name: "North coaching" },
      amount_cents: 4900,
      currency: "usd",
      billing_type: "recurring",
      state: "paid",
      refunded_cents: 0,
      created_at: "2026-10-01T00:00:00Z",
    },
  ],
  next_cursor: null,
};

const ACTIVE = {
  account_id: "acct_1",
  state: "active",
  charges_enabled: true,
  payouts_enabled: true,
};

function routeGets(over: Record<string, unknown | Error> = {}) {
  const map: Record<string, unknown> = {
    "/v1/coach/money/summary": SUMMARY,
    "/v1/coach/money/attention": ATTENTION,
    "/v1/coach/money/charges": CHARGES,
    "/coach/connect/payouts": [
      {
        id: "po_1",
        amount: 94.8,
        currency: "usd",
        status: "in_transit",
        arrival_date: "2026-10-05T00:00:00Z",
        created_at: "2026-10-02T00:00:00Z",
        description: null,
      },
    ],
    "/coach/connect/metrics": {
      active_clients: 7,
      clients_added_30d: 3,
      sub_coach_acquisition_30d: 0,
      sub_coach_churn_30d: 0,
    },
    "/coach/connect/status": ACTIVE,
    ...over,
  };
  mockGet.mockImplementation(async (url: string) => {
    const v = map[url];
    if (v instanceof Error) throw v;
    if (v === undefined) throw httpError(404);
    return { data: v };
  });
}

beforeEach(() => {
  mockGet.mockReset();
  mockPost.mockReset();
  mockNavigate.mockReset();
  mockReplace.mockReset();
  mockParentNavigate.mockReset();
  mockOpenBrowser.mockReset();
  mockOnline = true;
});

describe("AUD-OPUS-4 probe B-332-1: range switch keeps the old period's numbers under the new label", () => {
  it("a failed YTD load shows the 30-day net labelled Year to date, with no error", async () => {
    routeGets();
    const { findByTestId, getByTestId, queryByTestId, getByText } = await render(<MoneyScreen />);
    expect((await findByTestId("money-net-amount")).props.children).toBe("$94.80");
    // From now on the summary route fails (e.g. offline / 5xx).
    routeGets({ "/v1/coach/money/summary": httpError(503) });
    await fireEvent.press(getByTestId("money-range-ytd"));
    await waitFor(() =>
      expect(mockGet.mock.calls.filter((c) => c[0] === "/v1/coach/money/summary").length).toBeGreaterThan(0),
    );
    await new Promise((r) => setTimeout(r, 50));
    // What the coach sees:
    const label = getByText(/^Net to you, /);
    // eslint-disable-next-line no-console
    console.log("LABEL:", JSON.stringify(label.props.children), "AMOUNT:", getByTestId("money-net-amount").props.children,
      "CHANGE:", queryByTestId("money-net-change")?.props.children, "ERROR SHOWN:", queryByTestId("money-summary-error") !== null);
    expect(queryByTestId("money-summary-error")).toBeNull();
    expect(getByTestId("money-net-amount").props.children).toBe("$94.80");
  });
});
