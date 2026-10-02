const guard = require('../check-expected-env');

it.each(['pk_live_', 'pk_test_'])('AUD-SOL: bare publishable-key prefix %s is not a usable release credential', value => {
  const problem = guard.valueProblem('EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY', value, { stripe: 'any' });
  console.info('AUD-SOL bare Stripe prefix', value, { problem: problem || null });
  expect(problem).toBeDefined();
});

it('AUD-SOL: a JWT with empty header and signature is not a usable anon key', () => {
  const payload = Buffer.from(JSON.stringify({ role: 'anon' })).toString('base64url');
  const problem = guard.valueProblem('EXPO_PUBLIC_SUPABASE_ANON_KEY', `.${payload}.`, {});
  console.info('AUD-SOL empty JWT segments', { problem: problem || null });
  expect(problem).toBeDefined();
});

it('AUD-SOL: URL failure never reflects private configuration text', () => {
  const canary = 'auditsyntheticprivatecanary';
  const problem = guard.valueProblem('EXPO_PUBLIC_API_URL', `${canary}:opaque`, {});
  console.info('AUD-SOL synthetic URL diagnostic', problem);
  expect(problem).toBeDefined();
  expect(problem).not.toContain(canary);
});

it('AUD-SOL positive: real service-role rejection does not reflect the token', () => {
  const payload = Buffer.from(JSON.stringify({ role: 'service_role', private: 'audit-only' })).toString('base64url');
  const token = `a.${payload}.c`;
  const problem = guard.valueProblem('EXPO_PUBLIC_SUPABASE_ANON_KEY', token, {});
  expect(problem).toContain('SERVICE ROLE');
  expect(problem).not.toContain(token);
});
