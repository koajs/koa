module.exports = {
  name: 'Koa Coverage Report',
  cleanCache: true,
  reports: [
    'console-details',
    'v8-json',
    'v8',
    'codecov'
  ],
  entryFilter: {
    '**/node_modules/**': false,
    '**/__tests__/**': false,
    '**/lib/**': true
  },
  onEnd: (results) => {
    console.log(`coverage report generated: ${results.reportPath}`)
  }
}
