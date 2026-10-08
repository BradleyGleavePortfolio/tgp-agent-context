const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
  await p.goto('file://' + (process.env.PROTO || '/home/user/workspace/specs132/proto') + '/index.html'); await p.waitForTimeout(800);
  const items = await p.$$eval('#navlist .nav-item', els => els.map(e => ({ i: e.dataset.i, label: e.getAttribute('aria-label') })));
  const fs = require('fs'); fs.writeFileSync('shots/index.json', JSON.stringify(items, null, 1));
  for (const it of items) {
    await p.click(`#navlist .nav-item[data-i="${it.i}"]`); await p.waitForTimeout(450);
    const el = await p.$('#screen');
    await el.screenshot({ path: `shots/${String(it.i).padStart(2,'0')}.png` });
  }
  await b.close(); console.log('done', items.length);
})();
