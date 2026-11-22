const test = require("node:test");
const assert = require("node:assert/strict");

test("global matching returns every occurrence and correct offsets", () => {
  const input = "cat dog cat";
  const matches = [...input.matchAll(/cat/g)];
  assert.deepEqual(matches.map(m => m.index), [0, 8]);
});

test("ignore-case matching works with global mode", () => {
  assert.equal("Cat cAT dog".match(/cat/gi).length, 2);
});

test("capture groups preserve their values", () => {
  const match = /(?<year>\\d{4})-(\\d{2})/.exec("date 2026-11");
  assert.equal(match[1], "2026");
  assert.equal(match[2], "11");
  assert.equal(match.groups.year, "2026");
});

test("backreferences find adjacent repeated words", () => {
  assert.equal(/\\b(\\w+)\\s+\\1\\b/i.test("this is is useful"), true);
  assert.equal(/\\b(\\w+)\\s+\\1\\b/i.test("this is useful"), false);
});

test("lookahead checks context without consuming it", () => {
  assert.deepEqual([...("12 USD and 9 EUR".matchAll(/\\d+(?= USD)/g))].map(m => m[0]), ["12"]);
});

test("Unicode property escapes match non-ASCII letters", () => {
  assert.equal(/^\\p{Letter}+$/u.test("café"), true);
});

test("lazy quantifiers stop at the earliest closing delimiter", () => {
  assert.equal("<b>one</b><i>two</i>".match(/<.*?>/g).length, 4);
});

test("zero-width global matches advance safely", () => {
  assert.equal([...("abc".matchAll(/^/gm))].length, 1);
});

test("replacement supports capture references", () => {
  assert.equal("Lovelace, Ada".replace(/(\\w+),\\s*(\\w+)/, "$2 $1"), "Ada Lovelace");
});

test("invalid patterns throw a SyntaxError", () => {
  assert.throws(() => new RegExp("(", "g"), SyntaxError);
});
