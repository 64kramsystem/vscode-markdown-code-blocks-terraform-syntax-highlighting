const assert = require('node:assert/strict');
const { before, test } = require('node:test');
const MarkdownIt = require('markdown-it');
const { activate } = require('../dist/extension.cjs');

let preview;
before(async () => {
    const api = await activate();
    preview = api.extendMarkdownIt(new MarkdownIt());
});

function highlighted(html) {
    assert.match(html, /class="hljs-number">42<\/span>/);
    const comments = [...html.matchAll(/class="hljs-comment">([^<]*)<\/span>/g)]
        .map(match => match[1]).join('');
    assert.ok(comments.includes('# comment'));
}

function plainText(html) {
    return html.replace(/<span class="hljs-[^"]+">|<\/span>/g, '')
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
}

for (const language of ['tf', 'terraform', 'TF', 'TERRAFORM']) {
    for (const fence of ['```', '~~~']) {
        test(`renders ${fence}${language} in preview`, () => {
            highlighted(preview.render(`${fence}${language}\ncount = 42 # comment\n${fence}\n`));
        });
    }
}

test('renders fenced blocks in lists and blockquotes with info attributes', () => {
    for (const markdown of [
        '> ```tf\n> count = 42 # comment\n> ```\n',
        '- item\n\n  ~~~terraform title=example\n  count = 42 # comment\n  ~~~~\n',
    ]) highlighted(preview.render(markdown));
});

test('escapes HTML while preserving the code including whitespace and Unicode', () => {
    const code = 'value = "<script>alert(1)</script>& 🦊"\n\tcount = 42  \n\n';
    const html = preview.render('```tf\n' + code + '```\n');
    assert.ok(!html.includes('<script>'));
    assert.match(html, /&lt;script&gt;/);
    assert.equal(plainText(html.match(/<code[^>]*>([\s\S]*)<\/code>/)[1]), code);
});

test('keeps heredoc state across lines and resets between code blocks', () => {
    const html = preview.render('```tf\nvalue = <<EOF\nhello\nEOF\ncount = 42 # comment\n```\n');
    assert.match(html, /hljs-string">hello<\/span>/);
    highlighted(html);
    highlighted(preview.render('```tf\nvalue = "unfinished\n```\n\n```tf\ncount = 42 # comment\n```\n'));
    highlighted(preview.render('```tf\nvalue = <<EOF\nunfinished\n```\n\n```tf\ncount = 42 # comment\n```\n'));
});

test('highlights Terraform types, functions, literals and string interpolation', () => {
    const html = preview.render('```tf\nresource "aws_instance" "example" {\nvalue = upper("${var.name}")\nenabled = true\n}\n```\n');
    assert.match(html, /hljs-type">resource<\/span>/);
    assert.match(html, /hljs-built_in">upper<\/span>/);
    assert.match(html, /hljs-literal">true<\/span>/);
    assert.match(html, /hljs-variable">name<\/span>/);
    assert.ok(!html.includes('hljs-keyword">=</span>'));
    assert.ok(!html.includes('hljs-keyword">${</span>'));
});

test('leaves other languages and nested fence-looking text to the existing renderer', async () => {
    const calls = [];
    const md = (await activate()).extendMarkdownIt(new MarkdownIt({
        highlight(code, language) {
            calls.push({ code, language });
            return 'OTHER-HIGHLIGHTER';
        },
    }));
    assert.match(md.render('```js\nconsole.log(42)\n```\n'), /OTHER-HIGHLIGHTER/);
    assert.equal(calls[0].language, 'js');
    assert.match(md.render('````markdown\n```tf\ncount = 42\n```\n````\n'), /OTHER-HIGHLIGHTER/);
    assert.equal(calls[1].language, 'markdown');
    assert.match(md.render('```tf-other\ncount = 42\n```\n'), /OTHER-HIGHLIGHTER/);
    assert.equal(calls[2].language, 'tf-other');
    assert.equal(calls.length, 3);
    assert.ok(!preview.render('```text\ncount = 42\n```\n').includes('hljs-number'));
});
