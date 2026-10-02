const wt = '/home/user/workspace/wt/aud-sol5-332';
module.exports = {
  ...require(wt + '/package.json').jest,
  rootDir: wt,
  roots: ['/home/user/workspace/ops/evidence/AUD-SOL-5-112'],
  modulePaths: [wt + '/node_modules'],
  testMatch: ['/home/user/workspace/ops/evidence/AUD-SOL-5-112/aud-sol5-money-mobile.test.tsx'],
};
