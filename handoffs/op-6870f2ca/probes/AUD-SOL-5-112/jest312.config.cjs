const wt = '/home/user/workspace/wt/aud-sol5-312';
module.exports = {
  ...require(`${wt}/package.json`).jest,
  rootDir: wt,
  roots: [__dirname],
  modulePaths: [`${wt}/node_modules`],
  testMatch: ['**/aud-sol5-preferences.test.tsx'],
};
