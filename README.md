# VSCode Markdown Fenced Code Block Grammar Injections

My grammar injections, based on [Matt Bierner's work](https://github.com/mjbvz/vscode-fenced-code-block-grammar-injection-example).

Currently, Assembly (`asm`) and HCL (Terraform, `tf`) are supported.

## Integration notes

When integrating into an existing project, a new new language id entry needs to be added; if an existing one is recycled, the gramm will apply only to the new scope.

See [PR on ASM Code Lens](https://github.com/maziac/asm-code-lens/pull/65).
