/** No-network probe of the real axios client, Roman API and account-bound hook. */
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { InternalAxiosRequestConfig } from 'axios';
import api from '../api';
import { secureStorage } from '../secureStorage';
import { useRomanChats } from '../../screens/settings/useRomanChats';
import { authEvents } from '../../utils/authEvents';

jest.mock('../secureStorage', () => ({
  secureStorage: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() },
}));
jest.mock('../sentry', () => ({ captureError: jest.fn(), setSentryUser: jest.fn() }));
jest.mock('../../utils/logger', () => ({ logger: { warn: jest.fn(), info: jest.fn(), error: jest.fn(), debug: jest.fn(), log: jest.fn() } }));

it('AUD-SOL: deleting A history cannot acquire B credentials during asynchronous secure-storage read', async () => {
  let user: string | null = 'user-a';
  let pauseNextTokenRead = false;
  let paused = false;
  let finishTokenRead!: (token: string) => void;
  const tokenRead = new Promise<string>(resolve => { finishTokenRead = resolve; });
  const erasedOwners: string[] = [];
  const sessionUserId = () => user;
  const storage = secureStorage.getItem as jest.Mock;
  storage.mockImplementation(async (key: string) => {
    if (key !== 'supabase_token') return null;
    if (pauseNextTokenRead) {
      pauseNextTokenRead = false;
      paused = true;
      return tokenRead;
    }
    return user === 'user-a' ? 'synthetic-jwt-a' : 'synthetic-jwt-b';
  });
  const originalAdapter = api.defaults.adapter;
  api.defaults.adapter = async (cfg: InternalAxiosRequestConfig) => {
    const principal = String(cfg.headers.Authorization).includes('jwt-b') ? 'user-b' : 'user-a';
    const data = cfg.method === 'delete' ? null : {
      sessions: [{
        id: principal === 'user-a' ? 'cuserachat' : 'cuserbchat',
        surface: 'client', dayKey: '2026-10-01', messageCount: 2,
        startedAt: '2026-10-01T08:00:00.000Z', lastActivityAt: '2026-10-01T08:01:00.000Z',
      }],
      nextCursor: null,
    };
    if (cfg.method === 'delete' && cfg.url === '/roman/sessions') erasedOwners.push(principal);
    return { data, status: cfg.method === 'delete' ? 204 : 200, statusText: 'OK', headers: {}, config: cfg };
  };
  try {
    const hook = await renderHook(() => useRomanChats({ sessionUserId }));
    await waitFor(() => expect(hook.result.current.chats[0]?.id).toBe('cuserachat'));
    pauseNextTokenRead = true;
    await act(async () => hook.result.current.deleteAll());
    await waitFor(() => expect(paused).toBe(true));
    user = null;
    await act(async () => authEvents.emit('logout'));
    user = 'user-b';
    await act(async () => authEvents.emit('login'));
    await act(async () => finishTokenRead('synthetic-jwt-b'));
    console.info('AUD-SOL real-client erased principals', erasedOwners);
    expect(erasedOwners).toEqual([]);
  } finally {
    api.defaults.adapter = originalAdapter;
  }
});
