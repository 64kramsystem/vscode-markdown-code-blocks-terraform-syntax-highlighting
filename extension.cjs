const fs = require('node:fs');
const path = require('node:path');
const textmate = require('vscode-textmate');
const oniguruma = require('vscode-oniguruma');
const terraform = require('./syntaxes/terraform.tmGrammar.json');

exports.activate = async function () {
    await oniguruma.loadWASM(fs.readFileSync(path.join(__dirname, 'onig.wasm')));
    const registry = new textmate.Registry({
        onigLib: Promise.resolve(oniguruma),
        loadGrammar: async scope => scope === terraform.scopeName ? terraform : null,
    });
    const grammar = await registry.loadGrammar(terraform.scopeName);
    return { extendMarkdownIt: md => extendMarkdownIt(md, grammar) };
};

function tokenClass(scopes) {
    for (const scope of scopes.slice().reverse()) {
        if (scope.startsWith('comment')) return 'comment';
        if (scope.startsWith('constant.numeric')) return 'number';
        if (scope.startsWith('constant.language')) return 'literal';
        if (scope.startsWith('constant.character')) return 'string';
        if (scope.startsWith('keyword.operator') || scope.startsWith('keyword.other.interpolation')) return '';
        if (scope.startsWith('keyword') || scope.startsWith('storage')) return 'keyword';
        if (scope.startsWith('support.function')) return 'built_in';
        if (scope.startsWith('entity.name')) return 'type';
        if (scope.startsWith('variable')) return 'variable';
        if (scope.startsWith('string')) return 'string';
    }
    return '';
}

function extendMarkdownIt(md, grammar) {
    const previousHighlight = md.options.highlight;
    md.options.highlight = function (code, language, ...args) {
        if (!/^(tf|terraform)$/i.test(language || '')) {
            return previousHighlight ? previousHighlight.call(this, code, language, ...args) : '';
        }
        let state = textmate.INITIAL;
        return code.split('\n').map(line => {
            const result = grammar.tokenizeLine(line, state);
            state = result.ruleStack;
            return result.tokens.map(token => {
                const value = md.utils.escapeHtml(line.slice(token.startIndex, token.endIndex));
                const kind = tokenClass(token.scopes);
                return kind ? `<span class="hljs-${kind}">${value}</span>` : value;
            }).join('');
        }).join('\n');
    };
    return md;
}
