# VSCode Markdown Code blocks Assembly Syntax highlighting

This extension adds Assembly syntax highlighting to Markdown fenced code blocks.

Code blocks like the following:

    ```asm
    main:
            mov eax, 0xDEADCAFE
            int 3
    ```

will be highlighted, like:

![Highlighted block rendering](https://github.com/64kramsystem/vscode-markdown-code-blocks-asm-syntax-highlighting/blob/master/readme_images/hightlighted_block_rendering.png?raw=true)

This work based on [Matt Bierner's work](https://github.com/mjbvz/vscode-fenced-code-block-grammar-injection-example).

## Setup

This extension does not add the grammar; it only connects Markdown ASM code blocks to the existing ASM grammar.

For this reason, it requires a preexisting extension that provides the grammar, for example, [nasm x86 syntax highlighting](https://marketplace.visualstudio.com/items?itemName=LucianIrsigler.nasm).

## Integration notes

When integrating into an existing project, a new language id entry needs to be added; if an existing one is recycled, the grammar will apply only to the new scope.

See [PR on ASM Code Lens](https://github.com/maziac/asm-code-lens/pull/65).
