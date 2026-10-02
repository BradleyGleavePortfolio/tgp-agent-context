import { CoachWelcomeService } from '../../src/engagement/coach-welcome.service';
import { WorkoutReminderService } from '../../src/engagement/workout-reminder.service';
import type { PrismaService } from '../../src/prisma.service';
import type { MessagingService } from '../../src/messaging/messaging.service';
import type { NotificationsService } from '../../src/notifications/notifications.service';
import { cast, FakeTable } from './_fake-db';

it('a live stale welcome worker cannot duplicate the reclaimed worker message', async () => {
  const users = new FakeTable();
  const settings = new FakeTable();
  const jobs = new FakeTable([['client_id'], ['message_id']]);
  const messages = new FakeTable();
  const t = new Date('2026-10-05T17:13:00Z');
  await users.create({ data: { id: 'client', name: 'Dana', coach_id: 'coach', deleted_at: null, deletion_scheduled_at: null } });
  await users.create({ data: { id: 'coach', name: 'Morgan' } });
  await settings.create({ data: { coach_id: 'coach', enabled: true, template: null } });
  await jobs.create({ data: { id: 'job', client_id: 'client', coach_id: 'coach', status: 'pending', fire_at: t, attempt_count: 0, rendered_body: null } });
  const db = { user: users, coachWelcomeMessageSetting: settings, coachWelcomeMessageJob: jobs, coachMessage: messages };
  let release = () => {};
  let started = () => {};
  const firstStarted = new Promise<void>(resolve => { started = resolve; });
  const gate = new Promise<void>(resolve => { release = resolve; });
  let n = 0;
  const sendAsCoach = jest.fn(async (_coach: string, _client: string, payload: { body: string }) => {
    n += 1;
    if (n === 1) { started(); await gate; }
    return messages.create({ data: { coach_id: 'coach', client_id: 'client', sender_id: 'coach', body: payload.body } });
  });
  const make = () => new CoachWelcomeService(cast<PrismaService>(db), cast<MessagingService>({ sendAsCoach }));
  const stats = () => ({ scheduled: 0, skipped: 0, sent: 0, cancelled: 0, retried: 0, failed: 0 });
  const first = make().dispatch(t, stats());
  await firstStarted;
  await make().dispatch(new Date(t.getTime() + 6 * 60_000), stats());
  release();
  await first;
  expect(messages.rows).toHaveLength(1);
});

it('in-app-only workout reminder preferences still deliver the in-app channel', async () => {
  const createNotification = jest.fn();
  const pushToUser = jest.fn(async () => ({ delivered: true, code: 'delivered' }));
  const db = {
    clientWorkoutAssignment: new FakeTable(),
    workoutSession: new FakeTable(),
    workoutReminderDelivery: new FakeTable([['client_id', 'local_date']]),
  };
  const svc = new WorkoutReminderService(cast<PrismaService>(db), cast<NotificationsService>({
    getPreferences: async () => ({ timezone: 'America/Los_Angeles', workout_reminder_push: false, workout_reminder_inapp: true }),
    createNotification, pushToUser,
  }));
  await svc.processClient('client', '2026-10-05', 'morning', new Date('2026-10-05T14:00:00Z'));
  expect(createNotification).toHaveBeenCalledTimes(1);
  expect(pushToUser).not.toHaveBeenCalled();
});
