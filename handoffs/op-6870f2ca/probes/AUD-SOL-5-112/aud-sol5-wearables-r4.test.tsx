import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosError, AxiosHeaders } from 'axios';

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { extra: { healthConnectEnabled: true } } },
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
const mockOauth = jest.fn();
jest.mock('/home/user/workspace/wt/aud-sol5-317/src/hooks/useWearableConnections', () => ({
  useStartOauth: () => ({ mutateAsync: mockOauth, isPending: false }),
  useInvalidateWearableConnections: () => jest.fn(),
}));
jest.mock('expo-web-browser', () => ({ openAuthSessionAsync: jest.fn() }));
const mockPrompt = jest.fn();
jest.mock('/home/user/workspace/wt/aud-sol5-317/src/services/health/onDeviceConnect', () => ({
  connectOnDeviceProvider: () => mockPrompt(),
}));
const mockIdentity = jest.fn();
jest.mock('/home/user/workspace/wt/aud-sol5-317/src/lib/userCache', () => ({
  readUserCache: () => mockIdentity(),
}));
const mockRegister = jest.fn();
jest.mock('/home/user/workspace/wt/aud-sol5-317/src/api/wearablesConnectionsApi', () => {
  const actual = jest.requireActual('/home/user/workspace/wt/aud-sol5-317/src/api/wearablesConnectionsApi');
  return {
    ...actual,
    wearablesConnectionsApi: {
      ...actual.wearablesConnectionsApi,
      registerOnDevice: (...args: unknown[]) => mockRegister(...args),
    },
  };
});
const mockHealthKit = jest.fn();
jest.mock('/home/user/workspace/wt/aud-sol5-317/src/services/health/healthkit', () => ({
  healthKitSyncService: { sync: (...args: unknown[]) => mockHealthKit(...args) },
}));
const mockNativeRead = jest.fn();
const mockGranted = jest.fn();
jest.mock('react-native-health-connect', () => ({
  initialize: jest.fn(async () => true),
  getGrantedPermissions: () => mockGranted(),
  requestPermission: jest.fn(),
  readRecords: (...args: unknown[]) => mockNativeRead(...args),
}));
const mockReportUnexpected = jest.fn();
jest.mock('/home/user/workspace/wt/aud-sol5-317/src/lib/consultation/report', () => ({
  reportUnexpected: (...args: unknown[]) => mockReportUnexpected(...args),
}));

import ConnectProviderSheet from '/home/user/workspace/wt/aud-sol5-317/src/screens/client/wearables/ConnectProviderSheet';
import { beginSessionFence, OnDeviceSessionChangedError } from '/home/user/workspace/wt/aud-sol5-317/src/services/health/sessionFence';
import { syncHealthConnect } from '/home/user/workspace/wt/aud-sol5-317/src/services/health/healthConnect/healthConnectSyncService';
import { authEvents } from '/home/user/workspace/wt/aud-sol5-317/src/utils/authEvents';
import { getLocalAuthorization, getSyncProgress } from '/home/user/workspace/wt/aud-sol5-317/src/services/health/onDeviceState';

beforeEach(async () => {
  await AsyncStorage.clear();
  Object.defineProperty(Platform, 'OS', { get: () => 'ios', configurable: true });
  mockPrompt.mockReset().mockResolvedValue('granted');
  mockIdentity.mockReset().mockResolvedValue({ id: 'user-a' });
  mockRegister.mockReset().mockResolvedValue({ id: 'conn-a', user_id: 'user-a' });
  mockHealthKit.mockReset().mockResolvedValue({ postedCount: 7, complete: true });
  mockNativeRead.mockReset();
  mockGranted.mockReset();
  mockOauth.mockReset();
  mockReportUnexpected.mockReset();
});

test.each(['hide', 'unmount'])('B-317-6: %s while identity capture awaits must cancel the pending Connect tap', async (how) => {
  let resolveIdentity: (v: unknown) => void = () => undefined;
  mockIdentity.mockImplementationOnce(() => new Promise((resolve) => { resolveIdentity = resolve; }));
  const view = await render(<ConnectProviderSheet provider="APPLE_HEALTHKIT" visible onClose={jest.fn()} />);
  const pressed = Promise.resolve(fireEvent.press(screen.getByLabelText('Continue connecting Apple Health')));
  await waitFor(() => expect(mockIdentity).toHaveBeenCalledTimes(1));
  expect(mockPrompt).not.toHaveBeenCalled();
  if (how === 'hide') {
    await view.rerender(<ConnectProviderSheet provider="APPLE_HEALTHKIT" visible={false} onClose={jest.fn()} />);
  } else {
    await view.unmount();
  }
  resolveIdentity({ id: 'user-a' });
  await pressed;
  console.log('closed before fence resolved', {
    how,
    prompt: mockPrompt.mock.calls.length,
    register: mockRegister.mock.calls.length,
    phoneRead: mockHealthKit.mock.calls.length,
    localGrant: await getLocalAuthorization('user-a', 'APPLE_HEALTHKIT'),
  });
  expect(mockRegister).not.toHaveBeenCalled();
  expect(mockHealthKit).not.toHaveBeenCalled();
  expect(mockPrompt).not.toHaveBeenCalled();
});

test('B-317-7: logout during one native HC page must stop before another page or record type is read', async () => {
  Object.defineProperty(Platform, 'OS', { get: () => 'android', configurable: true });
  mockGranted.mockResolvedValue(['Steps', 'HeartRate', 'Weight'].map((recordType) => ({ accessType: 'read', recordType })));
  mockNativeRead
    .mockImplementationOnce(async () => {
      authEvents.emit('logout');
      return { records: [], pageToken: 'next-page' };
    })
    .mockResolvedValue({ records: [] });
  const fence = await beginSessionFence(async () => 'user-a');
  if (!fence) throw new Error('test identity was unexpectedly absent');
  const scope = { userId: 'user-a', connectionId: 'conn-a', source: 'HEALTH_CONNECT' as const };
  const ingest = jest.fn(async (_samples: unknown, deps?: { beforeEachRequest?: () => Promise<void> }) => {
    await deps?.beforeEachRequest?.();
    return { inserted: 0, skipped: 0 };
  });
  const error = await syncHealthConnect(scope, { fence, ingestApi: { ingest } }).catch((e: unknown) => e);
  expect(error).toBeInstanceOf(OnDeviceSessionChangedError);
  expect((await getSyncProgress(scope)).completedThrough).toEqual({});
  console.log('native reads after logout during first page', mockNativeRead.mock.calls.map(([type, opts]) => ({ type, pageToken: opts.pageToken })));
  expect(mockNativeRead).toHaveBeenCalledTimes(1);
});

test.each([401, 500])('B-317-8: OAuth start HTTP %s must not be mislabeled as an internet problem', async (status) => {
  mockOauth.mockRejectedValue(new AxiosError('http', String(status), undefined, undefined, {
    status,
    statusText: '',
    headers: new AxiosHeaders({ 'x-request-id': 'oauth-ref-1234' }),
    config: { headers: new AxiosHeaders() },
    data: { code: status === 401 ? 'unauthorized' : 'internal_error' },
  }));
  await render(<ConnectProviderSheet provider="OURA" visible onClose={jest.fn()} />);
  await fireEvent.press(screen.getByLabelText('Continue connecting Oura'));
  console.log('OAuth status mapped to copy', { status, internetAdvice: !!screen.queryByText(/Check your internet connection/), reported: mockReportUnexpected.mock.calls.length });
  if (status === 401) {
    expect(screen.queryByText(/Log in again/)).not.toBeNull();
  } else {
    expect(screen.queryByText(/Reference oauth-re/)).not.toBeNull();
    expect(mockReportUnexpected).toHaveBeenCalled();
  }
});
