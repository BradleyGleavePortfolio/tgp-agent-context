const mockPost = jest.fn();
jest.mock('/home/user/workspace/wt/aud-sol5-329/src/services/api', () => ({
  __esModule: true,
  default: { post: (...a: unknown[]) => mockPost(...a) },
}));
import { coachSetupApi, toConnectView } from '/home/user/workspace/wt/aud-sol5-329/src/api/coachSetupApi';
import { connectCopy } from '/home/user/workspace/wt/aud-sol5-329/src/lib/coachSetup/connectCopy';

test('B-329-3: the saved step must round-trip the flat payload expected by resume', async () => {
  mockPost.mockImplementation(async (_url, body) => ({
    // Exact controller/service contract: controller passes body directly as
    // input.data; service stores input.data at step_data[String(step)].
    data: { current_step: 2, step_data: { '1': body }, is_complete: false },
  }));
  const progress = await coachSetupApi.saveStep(1, { practice_name: 'North', focus: ['Strength'] });
  console.log('round-trip step data', progress.stepData['1']);
  expect(progress.stepData['1']).toMatchObject({ practice_name: 'North', focus: ['Strength'] });
});

test('B-329-4: active account with requirements due needs visible details and an update action', () => {
  const view = toConnectView({
    state: 'active', account_id: 'acct', charges_enabled: true, payouts_enabled: true,
    action_required: true, requirements: {
      currently_due: ['external_account'], past_due: [],
      current_deadline: '2026-10-15T00:00:00Z',
    },
  });
  const copy = connectCopy(view);
  console.log('active account requirements', copy);
  expect(copy.due).toContain('Bank account for payouts');
  expect(copy.action).not.toBeNull();
});
