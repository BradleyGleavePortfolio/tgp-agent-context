const wt = '/home/user/workspace/wt/aud-sol5-641';
module.exports = {
  ...require(`${wt}/jest.config.js`),
  rootDir: wt,
  roots: [__dirname],
  testRegex: 'aud-sol5-money\\.spec\\.ts$',
};
