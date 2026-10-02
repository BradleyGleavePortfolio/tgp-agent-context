import React from 'react';
import { Switch } from 'react-native';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Screen from '/home/user/workspace/wt/aud-sol5-312/src/screens/settings/NotificationPreferencesScreen';

const mockGet = jest.fn(async () => ({ data: { workout_reminder_push: true } }));
const mockUpdate = jest.fn();
jest.mock('/home/user/workspace/wt/aud-sol5-312/src/services/api', () => ({
  notificationsApi: {
    getPreferences: (...a: unknown[]) => mockGet(...a),
    updatePreferences: (...a: unknown[]) => mockUpdate(...a),
  },
}));
jest.mock('/home/user/workspace/wt/aud-sol5-312/src/lib/analytics', () => ({ track: jest.fn() }));
jest.mock('/home/user/workspace/wt/aud-sol5-312/src/utils/haptics', () => ({ mediumTap: jest.fn() }));
jest.mock('/home/user/workspace/wt/aud-sol5-312/src/theme/ThemeProvider', () => ({
  useTheme: () => ({ colors: { background: '#fff', surface: '#fff',
    border: '#222', primary: '#333', textPrimary: '#000', textSecondary: '#444' } }),
}));

test('B-312-2: rapid off/on must not leave server off and visible switch on', async () => {
  await AsyncStorage.clear();
  let server = true;
  let completeFirst!: () => void;
  mockUpdate.mockImplementationOnce((body) => new Promise((resolve) => {
    completeFirst = () => { server = body.workout_reminder_push; resolve({ data: body }); };
  })).mockImplementationOnce(async (body) => {
    server = body.workout_reminder_push;
    return { data: body };
  });
  const screen = await render(<Screen navigation={{ goBack: jest.fn() } as never} />);
  await screen.findByLabelText('Workout reminders');
  await act(async () => {
    const toggle = screen.UNSAFE_getAllByType(Switch).find((node) => node.props.accessibilityLabel === 'Workout reminders');
    void toggle?.props.onValueChange(false);
  });
  await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1));
  await act(async () => {
    const toggle = screen.UNSAFE_getAllByType(Switch).find((node) => node.props.accessibilityLabel === 'Workout reminders');
    void toggle?.props.onValueChange(true);
  });
  await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(2));
  await act(async () => { completeFirst(); });
  const visible = screen.getByLabelText('Workout reminders').props.value;
  console.log('out-of-order preference writes', { visible, server });
  expect(visible).toBe(server);
});
