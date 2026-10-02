// Audit-only: real Expo callbacks under untransformed Node, current and prior plugin.
const fs = require('fs');
const path = require('path');
const Module = require('module');
const { execFileSync } = require('child_process');
const assert = require('assert/strict');
const root = process.argv[2];
const filename = path.join(root, 'plugins/withSentryNativeInit.js');
const config = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8')).expo;
const dsn = 'https://abc@o1.ingest.sentry.io/1';
const oldCode = execFileSync('git', ['show', '4c61d915:plugins/withSentryNativeInit.js'], { cwd: root, encoding: 'utf8' });
const oldModule = new Module(filename);
oldModule.filename = filename;
oldModule.paths = Module._nodeModulePaths(path.dirname(filename));
oldModule._compile(oldCode, filename);
const current = require(filename);
const prior = oldModule.exports;
const key = 'EXPO_PUBLIC_SENTRY_DSN';
const oldDsn = process.env[key];
const oldSwitch = process.env.TGP_SENTRY_NATIVE_INIT;
async function mod(plugin, platform, text) {
  const cfg = plugin({ ...config, mods: {} });
  const target = platform === 'ios' ? 'appDelegate' : 'mainApplication';
  const result = await cfg.mods[platform][target]({
    ...cfg, modRequest: {},
    modResults: { contents: text, language: platform === 'ios' ? 'swift' : 'kt' },
  });
  return result.modResults.contents;
}
(async () => {
  for (const [version, plugin] of [['prior', prior], ['current', current]]) {
    for (const [platform, fixture, marker] of [
      ['ios', 'AppDelegate.sdk56.swift', 'SentrySDK.start'],
      ['android', 'MainApplication.sdk56.kt', 'SentryAndroid.init'],
    ]) {
      const input = fs.readFileSync(path.join(root, 'plugins/__tests__/fixtures', fixture), 'utf8');
      for (const disable of ['kill switch', 'remove DSN']) {
        process.env[key] = dsn;
        delete process.env.TGP_SENTRY_NATIVE_INIT;
        const enabled = await mod(plugin, platform, input);
        assert(enabled.includes(marker));
        assert.equal(await mod(plugin, platform, enabled), enabled);
        if (disable === 'kill switch') process.env.TGP_SENTRY_NATIVE_INIT = '0';
        else delete process.env[key];
        const disabled = await mod(plugin, platform, enabled);
        if (version === 'current') {
          assert.equal(disabled, input);
          assert(!disabled.includes(marker));
          assert(!disabled.includes(dsn));
          process.env[key] = dsn;
          delete process.env.TGP_SENTRY_NATIVE_INIT;
          assert.equal(await mod(plugin, platform, disabled), enabled);
        } else {
          assert(disabled.includes(marker));
          assert(disabled.includes(dsn));
        }
        console.log(`${version} ${platform} ${disable}: ${version === 'current' ? 'reconciled, re-enable stable' : 'original defect positively reproduced'}`);
      }
    }
  }
})().finally(() => {
  if (oldDsn === undefined) delete process.env[key]; else process.env[key] = oldDsn;
  if (oldSwitch === undefined) delete process.env.TGP_SENTRY_NATIVE_INIT; else process.env.TGP_SENTRY_NATIVE_INIT = oldSwitch;
}).catch((e) => { console.error(e); process.exitCode = 1; });
