var test = require('tape');
var lib = require('..');

// allow our test to be required by another library
// note that if the test is run using tape, this will
// be true - so make sure it's run using node - or
// remove this entirely.
if (module.parent) {
  module.exports = test.createStream({ objectMode: true });
}

test('litmus', function (assert) {
  assert.plan(1);
  assert.equal(lib(), 'world', 'our sample returned correctly');
});

// remove this test - it just shows that tap spec is working as we want
test('failure - should be removed', function (assert) {
  assert.plan(1);
  throw new Error('intentially bailing to ensure tap-spec does not swallow');
});