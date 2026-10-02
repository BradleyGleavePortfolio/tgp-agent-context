/** Auditor-only executable boundary probes; candidate production code is unchanged. */
import React from 'react';
import { act, fireEvent, render, renderHook, waitFor } from '@testing-library/react-native';
import RomanConversationsScreen from '../RomanConversationsScreen';
import RomanConversationScreen from '../RomanConversationScreen';
import { useRomanChats } from '../useRomanChats';
import { romanChatsEvents } from '../romanChatsEvents';
import { authEvents } from '../../../utils/authEvents';
import { chatDateLabel } from '../romanChatsCopy';
import type { RomanChatSummary, RomanChatsApi, RomanChatsOutcome, RomanChatPage } from '../../../api/romanChatsApi';

jest.mock('../../../services/api', () => ({ __esModule: true, default: {} }));
jest.mock('../../../utils/haptics', () => ({ lightTap: jest.fn(), mediumTap: jest.fn(), warningTap: jest.fn(), selectionTap: jest.fn() }));
jest.mock('../../../utils/logger', () => ({ logger: { warn: jest.fn(), info: jest.fn(), error: jest.fn(), debug: jest.fn(), log: jest.fn() } }));
jest.mock('../../../theme/ThemeProvider', () => ({ useTheme: () => ({ colors: new Proxy({}, { get: () => '#123456' }) }) }));
jest.mock('expo-font', () => ({ isLoaded: () => true, loadAsync: jest.fn() }));
jest.mock('../../../services/sentry', () => ({ captureError: jest.fn(), setSentryUser: jest.fn() }));

const chat = (id: string): RomanChatSummary => ({
  id, surface: 'client', dayKey: '2026-10-01', messageCount: 2,
  startedAt: '2026-10-01T08:00:00.000Z', lastActivityAt: '2026-10-01T08:01:00.000Z',
});
const A = chat('cuserachat');
const B = chat('cuserbchat');
const ok = <T,>(value: T): RomanChatsOutcome<T> => ({ ok: true, value });
const page = (sessions: RomanChatSummary[], nextCursor: string | null = null): RomanChatsOutcome<RomanChatPage> => ok({ sessions, nextCursor });
function deferred<T>() {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>(r => { resolve = r; });
  return { promise, resolve };
}
let user: string | null;
const sessionUserId = () => user;
const navigation = { goBack: jest.fn(), navigate: jest.fn() };
function makeApi(over: Partial<Record<keyof RomanChatsApi, jest.Mock>> = {}): Record<keyof RomanChatsApi, jest.Mock> {
  return {
    list: jest.fn(async () => page(user === 'user-a' ? [A] : [B])),
    deleteOne: jest.fn(async () => ok(null)),
    deleteAll: jest.fn(async () => ok(null)),
    readMessages: jest.fn(async () => ok({ messages: [], nextCursor: null })),
    ...over,
  };
}
beforeEach(() => { user = 'user-a'; jest.clearAllMocks(); });

it('AUD-SOL: two UTC-day sessions on the same Pacific local day have distinct destructive labels', () => {
  const earlier = { startedAt: '2026-10-01T22:00:00.000Z' };
  const later = { startedAt: '2026-10-02T01:00:00.000Z' };
  console.info('AUD-SOL same-local-day labels', chatDateLabel(earlier), chatDateLabel(later));
  expect(chatDateLabel(earlier)).not.toEqual(chatDateLabel(later));
});

it('AUD-SOL: account A typed delete-all confirmation cannot authorize account B deletion', async () => {
  const sentOwners: Array<string | null> = [];
  const api = makeApi({ deleteAll: jest.fn(async () => { sentOwners.push(user); return ok(null); }) });
  const screen = await render(<RomanConversationsScreen navigation={navigation as never} api={api} sessionUserId={sessionUserId} />);
  await fireEvent.press(await screen.findByTestId('roman-chats-delete-all'));
  await fireEvent.changeText(screen.getByTestId('roman-chats-confirm-all-input'), 'DELETE');
  user = null;
  await act(async () => authEvents.emit('logout'));
  user = 'user-b';
  await act(async () => authEvents.emit('login'));
  // The pending sheet is still mounted/typed while the new account's list loads.
  await screen.findByTestId('roman-chat-row-cuserbchat');
  const staleConfirm = screen.queryByTestId('roman-chats-confirm-all-confirm');
  if (staleConfirm) await fireEvent.press(staleConfirm);
  console.info('AUD-SOL confirmation sent owners', sentOwners);
  expect(sentOwners).toEqual([]);
});

it('AUD-SOL: single-delete confirmation contains no old-account metadata after logout', async () => {
  const screen = await render(<RomanConversationsScreen navigation={navigation as never} api={makeApi()} sessionUserId={sessionUserId} />);
  await fireEvent.press(await screen.findByTestId('roman-chat-delete-cuserachat'));
  user = null;
  await act(async () => authEvents.emit('logout'));
  expect(screen.queryByText(/This permanently deletes your conversation with Roman from/)).toBeNull();
});

it('AUD-SOL: login refresh in flight cannot resurrect history after successful delete-all', async () => {
  const del = deferred<RomanChatsOutcome<null>>();
  const refresh = deferred<RomanChatsOutcome<RomanChatPage>>();
  const api = makeApi({
    list: jest.fn().mockResolvedValueOnce(page([A])).mockImplementationOnce(() => refresh.promise),
    deleteAll: jest.fn(() => del.promise),
  });
  const hook = await renderHook(() => useRomanChats({ api, sessionUserId }));
  await waitFor(() => expect(hook.result.current.chats).toEqual([A]));
  await act(async () => hook.result.current.deleteAll());
  await act(async () => authEvents.emit('login'));
  await waitFor(() => expect(api.list).toHaveBeenCalledTimes(2));
  await act(async () => del.resolve(ok(null)));
  await act(async () => refresh.resolve(page([A])));
  console.info('AUD-SOL delete-all late refresh', hook.result.current.chats.map(c => c.id), hook.result.current.notice?.text);
  expect(hook.result.current.chats).toEqual([]);
});

it('AUD-SOL: transcript delete completion from old account cannot navigate or publish a gone event', async () => {
  const del = deferred<RomanChatsOutcome<null>>();
  const api = makeApi({ deleteOne: jest.fn(() => del.promise) });
  const gone = jest.fn();
  const off = romanChatsEvents.onGone(gone);
  try {
    const params = { id: A.id, ownerId: 'user-a', startedAt: A.startedAt, surface: A.surface, messageCount: A.messageCount };
    const screen = await render(<RomanConversationScreen navigation={navigation as never} route={{ params }} api={api} sessionUserId={sessionUserId} />);
    await fireEvent.press(await screen.findByTestId('roman-chat-transcript-delete'));
    await fireEvent.press(screen.getByTestId('roman-chat-transcript-confirm-confirm'));
    user = null;
    await act(async () => authEvents.emit('logout'));
    user = 'user-b';
    await act(async () => authEvents.emit('login'));
    await act(async () => del.resolve(ok(null)));
    console.info('AUD-SOL transcript stale completion', { backs: navigation.goBack.mock.calls.length, gone: gone.mock.calls });
    expect(navigation.goBack).not.toHaveBeenCalled();
    expect(gone).not.toHaveBeenCalled();
  } finally { off(); }
});

it('AUD-SOL positive: pending single erase cannot be reintroduced by a page while the delete is pending', async () => {
  const del = deferred<RomanChatsOutcome<null>>();
  const api = makeApi({ deleteOne: jest.fn(() => del.promise), list: jest.fn(async () => page([A])) });
  const hook = await renderHook(() => useRomanChats({ api, sessionUserId }));
  await waitFor(() => expect(hook.result.current.chats).toEqual([A]));
  await act(async () => hook.result.current.deleteOne(A));
  await act(async () => hook.result.current.reload());
  expect(hook.result.current.chats).toEqual([]);
  await act(async () => del.resolve({ ok: false, failure: { reason: 'erase_incomplete' } }));
  expect(hook.result.current.chats).toEqual([A]);
});

it('AUD-SOL: a first-page answer taken before successful single erase cannot resurrect that erased row', async () => {
  const del = deferred<RomanChatsOutcome<null>>();
  const refresh = deferred<RomanChatsOutcome<RomanChatPage>>();
  const api = makeApi({
    deleteOne: jest.fn(() => del.promise),
    list: jest.fn().mockResolvedValueOnce(page([A])).mockImplementationOnce(() => refresh.promise),
  });
  const hook = await renderHook(() => useRomanChats({ api, sessionUserId }));
  await waitFor(() => expect(hook.result.current.chats).toEqual([A]));
  await act(async () => hook.result.current.deleteOne(A));
  await act(async () => authEvents.emit('login'));
  await act(async () => del.resolve(ok(null)));
  await act(async () => refresh.resolve(page([A])));
  console.info('AUD-SOL single erase late refresh', hook.result.current.chats.map(c => c.id));
  expect(hook.result.current.chats).toEqual([]);
});
