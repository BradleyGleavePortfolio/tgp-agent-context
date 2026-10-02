const wt = '/home/user/workspace/wt/aud-sol5-332';
module.exports = {
  ...require(`${wt}/package.json`).jest,
  rootDir: wt,
  roots: [__dirname],
  modulePaths: [`${wt}/node_modules`],
  testMatch: ['**/aud-opus4-332-probe.test.tsx'],
};
