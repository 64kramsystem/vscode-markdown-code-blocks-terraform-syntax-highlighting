# VSCode Markdown Code blocks Terraform Syntax highlighting

This extension adds Terraform syntax highlighting to Markdown fenced code blocks.

Code blocks like the following:

    ```tf
    terraform {
      required_version = "1.1.2"
    }

    provider "aws" {
      region = var.aws_default_region
    }
    ```

will be highlighted, like:

![Highlighted block rendering](https://github.com/64kramsystem/vscode-markdown-code-blocks-terraform-syntax-highlighting/blob/readme_images/hightlighted_block_rendering.png/test.png?raw=true)

This work based on [Matt Bierner's work](https://github.com/mjbvz/vscode-fenced-code-block-grammar-injection-example).

## Setup

This extension does not add the grammar; it only connects Markdown ASM code blocks to the existing ASM grammar.

For this reason, it requires a preexisting extension that provides the grammar, for example, [Terraform](https://marketplace.visualstudio.com/items?itemName=4ops.terraform).

