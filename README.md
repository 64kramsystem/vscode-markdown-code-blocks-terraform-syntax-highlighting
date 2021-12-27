# VSCode Markdown Code blocks Terraform Syntax highlighting

My Terraform grammar injection, based on [Matt Bierner's work](https://github.com/mjbvz/vscode-fenced-code-block-grammar-injection-example).

## Integration notes

When integrating into an existing project, a new new language id entry needs to be added; if an existing one is recycled, the gramm will apply only to the new scope.

See [PR on ASM Code Lens](https://github.com/maziac/asm-code-lens/pull/65).