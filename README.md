# VSCode Markdown Code blocks Terraform Syntax highlighting

My Terraform grammar injection, based on [Matt Bierner's work](https://github.com/mjbvz/vscode-fenced-code-block-grammar-injection-example).

## Setup

This extension does not add the grammar; it only connects Markdown ASM code blocks to the existing ASM grammar.

For this reason, it requires a preexisting extension that provides the grammar, for example, [Terraform](https://marketplace.visualstudio.com/items?itemName=4ops.terraform).

## Integration notes

When integrating into an existing project, a new new language id entry needs to be added; if an existing one is recycled, the gramm will apply only to the new scope.

See [PR on ASM Code Lens](https://github.com/maziac/asm-code-lens/pull/65).