import { CoachWelcomeService } from '/home/user/workspace/wt/aud-sol5-609/src/engagement/coach-welcome.service';
import { WorkoutReminderService } from '/home/user/workspace/wt/aud-sol5-609/src/engagement/workout-reminder.service';
import { FakeTable } from '/home/user/workspace/wt/aud-sol5-609/test/engagement/_fake-db';

test('B-609-3: a stale but still live sender must not duplicate the reclaimed welcome', async () => {
  const users = new FakeTable();
  const jobs = new FakeTable([['client_id'], ['message_id']], () => ({
    attempt_count: 0, rendered_body: null, next_retry_at: null,
  }));
  const settings = new FakeTable();
  const messages = new FakeTable();
  await users.create({ data: { id: 'client', coach_id: 'coach', name: 'Dana' } });
  await users.create({ data: { id: 'coach', name: 'Morgan' } });
  await settings.create({ data: { coach_id: 'coach', enabled: true, template: null } });
  const fire = new Date();
  await jobs.create({ data: {
    id: 'job', client_id: 'client', coach_id: 'coach', status: 'pending',
    created_at: new Date(fire.getTime() - 13 * 60000),
    fire_at: fire,
  } });
  let release!: () => void;
  let entered!: () => void;
  const gate = new Promise<void>((r) => { release = r; });
  const started = new Promise<void>((r) => { entered = r; });
  let n = 0;
  const sendAsCoach = jest.fn(async (coach, client, payload) => {
    n += 1;
    if (n === 1) { entered(); await gate; }
    return messages.create({ data: {
      coach_id: coach, client_id: client, sender_id: coach, body: payload.body,
    } });
  });
  const p = { user: users, coachWelcomeMessageJob: jobs,
    coachWelcomeMessageSetting: settings, coachMessage: messages };
  const a: CoachWelcomeService = Reflect.construct(CoachWelcomeService, [p, { sendAsCoach }]);
  const b: CoachWelcomeService = Reflect.construct(CoachWelcomeService, [p, { sendAsCoach }]);
  const stats = () => ({ scheduled: 0, skipped: 0, sent: 0, cancelled: 0, retried: 0, failed: 0 });
  const first = a.dispatch(fire, stats());
  await started;
  await b.dispatch(new Date(fire.getTime() + 6 * 60000), stats());
  release();
  await first;
  console.log('live lease expiry', { sends: sendAsCoach.mock.calls.length, messages: messages.rows.length });
  expect(messages.rows).toHaveLength(1);
});

test('C-609-6: push-disabled/inapp-enabled client must still receive an inbox reminder', async () => {
  const notifications = {
    getPreferences: jest.fn(async () => ({
      workout_reminder_push: false, workout_reminder_inapp: true, timezone: 'America/Los_Angeles',
    })),
    createNotification: jest.fn(async () => ({ id: 'inapp' })),
    pushToUser: jest.fn(async () => ({ delivered: true })),
  };
  const p = {
    clientWorkoutAssignment: { findMany: jest.fn(async () => []) },
    workoutSession: { findFirst: jest.fn(async () => null) },
    workoutReminderDelivery: {
      create: jest.fn(async () => ({ id: 'delivery' })),
      update: jest.fn(async () => ({})),
    },
  };
  const service: WorkoutReminderService = Reflect.construct(WorkoutReminderService, [p, notifications]);
  const outcome = await service.processClient('client', '2026-10-05', 'morning', new Date('2026-10-05T14:00:00Z'));
  console.log('independent channel preference', outcome);
  expect(notifications.createNotification).toHaveBeenCalledTimes(1);
  expect(notifications.pushToUser).not.toHaveBeenCalled();
});

test('B-609-4: deletion after page selection must suppress the reminder send', async () => {
  let deleted = false;
  const notifications = {
    getPreferences: jest.fn(async () => ({
      workout_reminder_push: true, workout_reminder_inapp: true, timezone: 'America/Los_Angeles',
    })),
    createNotification: jest.fn(async () => ({ id: 'inapp' })),
    pushToUser: jest.fn(async () => ({ delivered: true })),
  };
  const p = {
    user: { findUnique: jest.fn(async () => ({
      role: 'student', deleted_at: deleted ? new Date() : null, deletion_scheduled_at: null,
    })) },
    clientOnboardingIntake: { findMany: jest.fn(async () => {
      // Simulate deletion finalization after DB produced the eligible page,
      // before processing the selected row. The page itself was valid.
      deleted = true;
      return [{ id: 'intake', client_id: 'client', first_session_date: new Date('2026-10-05Z'),
        preferred_training_time: 'morning' }];
    }) },
    clientWorkoutAssignment: { findMany: jest.fn(async () => []) },
    workoutSession: { findFirst: jest.fn(async () => null) },
    workoutReminderDelivery: {
      deleteMany: jest.fn(async () => ({ count: 0 })),
      create: jest.fn(async () => ({ id: 'delivery' })),
      update: jest.fn(async () => ({})),
    },
  };
  const service: WorkoutReminderService = Reflect.construct(WorkoutReminderService, [p, notifications]);
  await service.runOnce(new Date('2026-10-05T14:00:00Z'));
  console.log('post-selection deletion', { deleted, pushes: notifications.pushToUser.mock.calls.length,
    inapp: notifications.createNotification.mock.calls.length, rechecks: p.user.findUnique.mock.calls.length });
  expect(notifications.pushToUser).not.toHaveBeenCalled();
  expect(notifications.createNotification).not.toHaveBeenCalled();
  expect(p.workoutReminderDelivery.create).not.toHaveBeenCalled();
});
