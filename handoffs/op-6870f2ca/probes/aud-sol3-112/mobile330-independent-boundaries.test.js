const fs = require('fs');
const path = require('path');
const plugin = require('../../../plugins/withSentryNativeInit');
const ROOT = path.resolve(__dirname, '../../..');
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'app.json'), 'utf8')).expo;
const fixtures = path.join(ROOT, 'plugins/__tests__/fixtures');
const DSN = 'https://abc@o1.ingest.sentry.io/1';
const mockInit = jest.fn();
jest.mock('@sentry/react-native', () => ({
  init: (...args) => mockInit(...args),
  wrap: (component) => component,
  setUser: jest.fn(),
  withScope: jest.fn(),
  captureException: jest.fn(),
}));
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { version: '1.0.0', ios: { buildNumber: '6' }, extra: {} } },
}));

async function runRegisteredMod(platform, contents) {
  const cfg = plugin({ ...config, mods: {} });
  const key = platform === 'ios' ? 'appDelegate' : 'mainApplication';
  const result = await cfg.mods[platform][key]({
    ...cfg,
    modRequest: {},
    modResults: { contents, language: platform === 'ios' ? 'swift' : 'kt' },
  });
  return result.modResults.contents;
}

describe('independent registered native mods and JS privacy boundaries', () => {
  const saved = { ...process.env };
  beforeEach(() => {
    mockInit.mockClear();
    process.env.EXPO_PUBLIC_SENTRY_DSN = DSN;
    delete process.env.TGP_SENTRY_NATIVE_INIT;
  });
  afterEach(() => { process.env = { ...saved }; });

  for (const [platform, fixture, marker, before] of [
    ['ios', 'AppDelegate.sdk56.swift', 'SentrySDK.start', 'let factory = ExpoReactNativeFactory'],
    ['android', 'MainApplication.sdk56.kt', 'SentryAndroid.init', 'loadReactNative(this)'],
  ]) {
    it(`${platform}: actual registered mod inserts before React Native and is repeatable`, async () => {
      const source = fs.readFileSync(path.join(fixtures, fixture), 'utf8');
      const enabled = await runRegisteredMod(platform, source);
      expect(enabled).toContain(marker);
      expect(enabled.indexOf(marker)).toBeLessThan(enabled.indexOf(before));
      expect(await runRegisteredMod(platform, enabled)).toBe(enabled);
    });

    for (const disabling of ['kill switch', 'remove DSN']) {
      it(`${platform}: ${disabling} removes an existing generated initializer`, async () => {
        const source = fs.readFileSync(path.join(fixtures, fixture), 'utf8');
        const enabled = await runRegisteredMod(platform, source);
        if (disabling === 'kill switch') process.env.TGP_SENTRY_NATIVE_INIT = '0';
        else delete process.env.EXPO_PUBLIC_SENTRY_DSN;
        const disabled = await runRegisteredMod(platform, enabled);
        expect(disabled).not.toContain(marker);
        expect(disabled).not.toContain(DSN);
      });
    }
  }

  it('JS send boundary removes synthetic health/message content from HTTP breadcrumbs', () => {
    jest.isolateModules(() => { require('../sentry').initSentry(); });
    const options = mockInit.mock.calls[0][0];
    const canary = 'AUDIT_SYNTHETIC_PRIVATE_MESSAGE';
    const breadcrumb = { category: 'xhr', data: { method: 'GET', url: `https://api.example.test/api/search?q=${canary}`, status_code: 200 } };
    const accepted = options.beforeBreadcrumb ? options.beforeBreadcrumb(breadcrumb, {}) : breadcrumb;
    const event = { exception: { values: [{ type: 'Error', value: 'synthetic failure' }] }, breadcrumbs: accepted ? [accepted] : [] };
    const sent = options.beforeSend(event, {});
    expect(JSON.stringify(sent)).not.toContain(canary);
  });
});
