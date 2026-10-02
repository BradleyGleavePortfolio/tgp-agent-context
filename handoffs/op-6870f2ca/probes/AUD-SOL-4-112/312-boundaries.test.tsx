import React from 'react';
import { Alert, Switch } from 'react-native';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import NotificationPreferencesScreen from '../NotificationPreferencesScreen';
import { notificationsApi } from '../../../services/api';
jest.mock('../../../services/api', () => ({
  notificationsApi: { getPreferences: jest.fn(), updatePreferences: jest.fn() },
}));
jest.mock('../../../lib/analytics', () => ({ track: jest.fn() }));
jest.mock('../../../utils/haptics', () => ({ mediumTap: jest.fn() }));
jest.mock('../../../theme/ThemeProvider', () => ({
  useTheme: () => ({ colors: new Proxy({}, { get: () => '#123456' }) }),
}));
function cast<T>(v: object): T { return v as T; }
const navigation = cast<Parameters<typeof NotificationPreferencesScreen>[0]['navigation']>({ goBack: jest.fn() });
const get = notificationsApi.getPreferences as jest.Mock;
const update = notificationsApi.updatePreferences as jest.Mock;
beforeEach(() => { jest.clearAllMocks(); get.mockResolvedValue({ data: { workout_reminder_push: true } }); });
it('known 401 save failure gives sign-in recovery instead of a connection error', async () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  update.mockRejectedValue({ response: { status: 401, data: { code: 'unauthorized', request_id: 'audit-reference' } } });
  const screen = await render(<NotificationPreferencesScreen navigation={navigation} />);
  await fireEvent(await screen.findByLabelText('Workout reminders'), 'valueChange', false);
  await waitFor(() => expect(alert).toHaveBeenCalled());
  const calls = alert.mock.calls;
  alert.mockRestore();
  expect(calls[0].slice(0, 2).join(' ')).toMatch(/sign in|session|log in/i);
});
it('rapid off-on intents cannot leave UI on and backend off when requests complete out of order', async () => {
  const releases: Array<() => void> = [];
  let server = true;
  update.mockImplementation((body: { workout_reminder_push: boolean }) => new Promise(resolve => {
    releases.push(() => { server = body.workout_reminder_push; resolve({ data: body }); });
  }));
  const screen = await render(<NotificationPreferencesScreen navigation={navigation} />);
  await screen.findByLabelText('Workout reminders');
  const off = screen.UNSAFE_getAllByType(Switch)[2];
  await act(async () => { void off.props.onValueChange(false); });
  await waitFor(() => expect(releases).toHaveLength(1));
  const on = screen.UNSAFE_getAllByType(Switch)[2];
  await act(async () => { void on.props.onValueChange(true); });
  await waitFor(() => expect(releases).toHaveLength(2));
  await act(async () => releases[1]());
  await act(async () => releases[0]());
  expect((await screen.findByLabelText('Workout reminders')).props.value).toBe(server);
});
