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
  const match = /(?<year>\d{4})-(\d{2})/.exec("date 2026-11");
  assert.equal(match[1], "2026");
  assert.equal(match[2], "11");
  assert.equal(match.groups.year, "2026");
});

test("backreferences find adjacent repeated words", () => {
  assert.equal(/\b(\w+)\s+\1\b/i.test("this is is useful"), true);
  assert.equal(/\b(\w+)\s+\1\b/i.test("this is useful"), false);
});

test("lookahead checks context without consuming it", () => {
  assert.deepEqual([...("12 USD and 9 EUR".matchAll(/\d+(?= USD)/g))].map(m => m[0]), ["12"]);
});

test("Unicode property escapes match non-ASCII letters", () => {
  assert.equal(/^\p{Letter}+$/u.test("café"), true);
});

test("lazy quantifiers stop at the earliest closing delimiter", () => {
  assert.equal("<b>one</b><i>two</i>".match(/<.*?>/g).length, 4);
});

test("zero-width global matches advance safely", () => {
  assert.equal([...("abc".matchAll(/^/gm))].length, 1);
});

test("replacement supports capture references", () => {
  assert.equal("Lovelace, Ada".replace(/(\w+),\s*(\w+)/, "$2 $1"), "Ada Lovelace");
});

test("invalid patterns throw a SyntaxError", () => {
  assert.throws(() => new RegExp("(", "g"), SyntaxError);
});

const { compile, escapeLiteral } = require("../builder-core.js");

test("visual builder compiles literal text safely", () => {
  const source = compile([{ type: "literal", value: "a.b+c" }]);
  assert.equal(source, "a\\.b\\+c");
  assert.equal(new RegExp(source).test("a.b+c"), true);
});

test("visual builder combines shorthands and quantifiers", () => {
  const source = compile([
    { type: "start" }, { type: "digit", quantifier: "+" },
    { type: "literal", value: "-" }, { type: "digit", quantifier: "{2,4}" },
    { type: "end" }
  ]);
  assert.equal(source, "^\\d+-\\d{2,4}$");
});

test("visual builder supports groups, alternation and lookarounds", () => {
  assert.equal(compile([{ type: "alternation", value: "cat|dog" }]), "(?:cat|dog)");
  assert.equal(compile([{ type: "lookahead", value: " USD" }]), "(?= USD)");
  assert.equal(compile([{ type: "group", value: "\\d+" }]), "(\\d+)");
});

test("visual builder rejects malformed classes and quantifiers", () => {
  assert.throws(() => compile([{ type: "class", value: "" }]), /needs characters/);
  assert.throws(() => compile([{ type: "literal", value: "x", quantifier: "{9}" }]), /Unsupported quantifier/);
  assert.throws(() => compile([{ type: "start", quantifier: "+" }]), /cannot have quantifiers/);
});

test("literal escaping covers regex metacharacters", () => {
  const literal = ".*+?^$()|[]\\";
  assert.equal(new RegExp(escapeLiteral(literal)).test(literal), true);
});


const { trace } = require("../debug-core.js");

test("debug trace records candidate starts, matches and captures", () => {
  const steps = trace("(cat|dog)", "i", "A CAT dog");
  assert.equal(steps[0].matched, false);
  assert.equal(steps[2].match, "CAT");
  assert.deepEqual(steps[2].captures, ["CAT"]);
  assert.equal(steps[6].match, "dog");
});

test("debug trace supports named captures and zero-width matches", () => {
  const steps = trace("(?<word>\\w+)", "u", "hi!");
  assert.equal(steps[0].groups.word, "hi");
  assert.equal(steps[2].matched, false);
  assert.equal(trace("(?=.)", "u", "hi!").filter(x => x.matched).length, 3);
});

test("debug trace rejects oversized input and duplicate flags", () => {
  assert.throws(() => trace(".", "", "12345", 4), /exceeds/);
  assert.throws(() => trace(".", "ii", "x"), /duplicates/);
});


const { convert } = require("../plain-english.js");

test("plain-English converter explains common tokens and flags", () => {
  const result = convert("^\\d{2,4}\\s+cat$", "gi");
  assert.match(result.text, /start of the input/);\n  assert.match(convert("cat").text, /literal text “cat”/);
  assert.match(result.text, /digit/);
  assert.match(result.text, /between 2 and 4 times/);
  assert.match(result.text, /ignore uppercase/);
  assert.match(result.text, /find all matches/);
});

test("plain-English converter explains alternatives and named captures", () => {
  const result = convert("(?<animal>cat|dog)s?");
  assert.match(result.text, /named capture group/);
  assert.match(result.text, /alternatives/);
  assert.match(result.text, /zero or one time/);
});

test("plain-English converter explains lookarounds and character classes", () => {
  assert.match(convert("[^a-z]+(?=!)").text, /not in/);
  assert.match(convert("(?<!\\\\d)cat").text, /not preceded by/);
});

test("plain-English converter handles empty patterns and flags", () => {
  assert.match(convert("", "").text, /empty pattern/);
  assert.match(convert(".", "s").text, /including line breaks/);
});
