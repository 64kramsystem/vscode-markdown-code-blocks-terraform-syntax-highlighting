const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { before, mock, test } = require('node:test');
const textmate = require('vscode-textmate');
const oniguruma = require('vscode-oniguruma');

const root = path.resolve(__dirname, '..');
const manifest = require('../package.json');
const aliases = ['tf', 'terraform'];
const code = 'count = 42 # comment';
const embedded = 'meta.embedded.block.markdown-code-blocks.terraform';
let grammar;

before(async () => {
    mock.method(console, 'error', (...args) => { throw new Error(args.join(' ')); });
    const wasm = fs.readFileSync(require.resolve('vscode-oniguruma/release/onig.wasm'));
    await oniguruma.loadWASM(wasm.buffer.slice(wasm.byteOffset, wasm.byteOffset + wasm.byteLength));
    const markdown = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/markdown.tmLanguage.json')));
    const grammars = new Map([[markdown.scopeName, markdown]]);
    const embeddedLanguages = {};
    for (const contribution of manifest.contributes.grammars) {
        grammars.set(contribution.scopeName, JSON.parse(fs.readFileSync(path.join(root, contribution.path))));
        for (const [scope, language] of Object.entries(contribution.embeddedLanguages || {})) {
            assert.ok(manifest.contributes.languages.some(entry => entry.id === language));
            embeddedLanguages[scope] = 2;
        }
    }
    const registry = new textmate.Registry({
        onigLib: Promise.resolve({
            createOnigScanner: patterns => new oniguruma.OnigScanner(patterns),
            createOnigString: value => new oniguruma.OnigString(value),
        }),
        loadGrammar: async scope => grammars.get(scope) || null,
        getInjections: scope => manifest.contributes.grammars
            .filter(entry => entry.injectTo?.includes(scope)).map(entry => entry.scopeName),
    });
    grammar = await registry.loadGrammarWithConfiguration(markdown.scopeName, 1, { embeddedLanguages });
});

function tokenize(lines) {
    let state = textmate.INITIAL;
    return lines.map(line => {
        const result = grammar.tokenizeLine(line, state);
        const binary = grammar.tokenizeLine2(line, state);
        state = result.ruleStack;
        return { line, tokens: result.tokens, binary: binary.tokens };
    });
}

function codeIsHighlighted(line) {
    const offset = line.line.indexOf('42');
    const number = line.tokens.find(token => token.startIndex <= offset && token.endIndex > offset);
    assert.ok(number.scopes.includes(embedded), JSON.stringify(line));
    assert.ok(number.scopes.some(scope => scope.startsWith('constant.numeric')), JSON.stringify(line));
    const comment = line.tokens.find(token => token.scopes.some(scope => scope.startsWith('comment')));
    assert.ok(comment, JSON.stringify(line));
    let metadata;
    for (let i = 0; i < line.binary.length && line.binary[i] <= offset; i += 2) {
        metadata = line.binary[i + 1];
    }
    assert.equal(metadata & 255, 2, 'code must have the registered embedded language ID');
}

function outsideCode(line) {
    assert.ok(line.tokens.every(token => !token.scopes.includes(embedded)), JSON.stringify(line));
}

for (const alias of aliases) {
    for (const marker of ['```', '~~~']) {
        for (const name of [alias, alias.toUpperCase()]) {
            test(`highlights ${marker}${name} without a language provider`, () => {
                const lines = tokenize([marker + name, code, marker, 'ordinary prose']);
                codeIsHighlighted(lines[1]);
                outsideCode(lines[2]);
                outsideCode(lines[3]);
            });
        }
    }
}

test('highlights within blockquotes and list items', () => {
    for (const prefix of ['> ', '> > ']) {
        const lines = tokenize([prefix + '```' + aliases[0], prefix + code, prefix + '```', 'prose']);
        codeIsHighlighted(lines[1]);
        outsideCode(lines[3]);
    }
    const lines = tokenize(['- item', '', '  ```' + aliases[0], '  ' + code, '  ```', '', 'prose']);
    codeIsHighlighted(lines[3]);
    outsideCode(lines[6]);
});

test('accepts whitespace, fence attributes, and an indented closing fence', () => {
    const lines = tokenize(['  ``` ' + aliases[0] + ' title=example', '  ' + code, ' ```  ', 'prose']);
    codeIsHighlighted(lines[1]);
    outsideCode(lines[3]);
});

test('accepts a longer closing fence of the same kind', () => {
    for (const marker of ['`', '~']) {
        const lines = tokenize([marker.repeat(3) + aliases[0], code, marker.repeat(5), 'prose']);
        codeIsHighlighted(lines[1]);
        outsideCode(lines[2]);
        outsideCode(lines[3]);
    }
});

test('short, mixed, opposite-kind, and annotated fences remain code', () => {
    for (const invalid of ['```', '~~~~', '````~', '```` trailing']) {
        const lines = tokenize(['````' + aliases[0], code, invalid, code, '````', 'prose']);
        codeIsHighlighted(lines[1]);
        codeIsHighlighted(lines[3]);
        outsideCode(lines[5]);
    }
});

test('fence-looking text inside another code block is left alone', () => {
    for (const outerLanguage of ['', 'text', 'markdown', 'python']) {
        const lines = tokenize(['````' + outerLanguage, '```' + aliases[0], code, '```', '````', 'prose']);
        lines.forEach(outsideCode);
        tokenize(['````' + outerLanguage, '```' + aliases[0], code, '````', 'prose']).forEach(outsideCode);
    }
});

test('indented code and unrelated language names are left alone', () => {
    for (const prefix of ['    ', '\t']) {
        tokenize([prefix + '```' + aliases[0], prefix + code, prefix + '```']).forEach(outsideCode);
    }
    for (const name of ['text', aliases[0] + '-other']) {
        tokenize(['```' + name, code, '```']).forEach(outsideCode);
    }
});

test('a closing fence ends even an unfinished language string', () => {
    const lines = tokenize(['```' + aliases[0], 'value = "unfinished', '```', 'prose']);
    outsideCode(lines[2]);
    outsideCode(lines[3]);
});

test('an unfinished block remains highlighted through the end of the document', () => {
    codeIsHighlighted(tokenize(['```' + aliases[0], code])[1]);
});

test('a second block can follow a longer closing fence', () => {
    const lines = tokenize(['```' + aliases[0], code, '````', '', '~~~' + aliases[1], code, '~~~', 'prose']);
    codeIsHighlighted(lines[1]);
    codeIsHighlighted(lines[5]);
    outsideCode(lines[7]);
});

test('bundled grammar distinguishes language-specific tokens', () => {
    const sample = 'resource "aws_instance" "example" {';
    const lines = tokenize(['```' + aliases[0], sample, '```']);
    const scopes = lines[1].tokens.flatMap(token => token.scopes);
    assert.ok(scopes.includes('entity.name.type.terraform'));
    assert.ok(scopes.includes('variable.other.enummember.hcl'));
});

test('heredocs end correctly inside lists and blockquotes', () => {
    for (const prefix of ['', '> ', '  ']) {
        const lines = tokenize([
            ...(prefix === '  ' ? ['- item', ''] : []),
            ...['~~~tf', 'value = <<-EOF', '```', 'text', 'EOF', code, '~~~'].map(line => prefix + line),
        ]);
        const text = lines.find(line => line.line === prefix + 'text');
        assert.ok(text.tokens.some(token => token.scopes.includes('string.unquoted.heredoc.hcl')));
        codeIsHighlighted(lines.find(line => line.line === prefix + code));
    }
});

test('computed object keys work after Markdown container prefixes', () => {
    for (const prefix of ['', '> ', '  ']) {
        const lines = tokenize([
            ...(prefix === '  ' ? ['- item', ''] : []),
            ...['```tf', 'value = {', '(var.key) = 42', '}', '```'].map(line => prefix + line),
        ]);
        const key = lines.find(line => line.line === prefix + '(var.key) = 42');
        assert.ok(key.tokens.some(token => token.scopes.includes('meta.mapping.key.hcl')), JSON.stringify(key));
    }
});
