# Markdown Terraform Code Block Highlighting

Highlights `tf` and `terraform` fenced code blocks in the VS Code Markdown editor. Fence names are case-insensitive; backticks and tildes are supported, including blocks in lists and blockquotes.

````markdown
```tf
resource "aws_instance" "example" {
  ami = var.ami_id
}
```
````

The HashiCorp Terraform syntax grammar is bundled. No additional extensions, runtime packages, or extension JavaScript are required. Requires VS Code 1.141 or later.

This extension provides editor syntax highlighting, not Markdown preview rendering or language-server features. It does not associate itself with standalone `.tf` files.

## Development

Run `npm ci` and `npm test` to test highlighting and Markdown boundaries with VS Code's TextMate engine. Test dependencies are excluded from the extension package.

## Credits

Based on [Matt Bierner's Markdown grammar injection example](https://github.com/mjbvz/vscode-fenced-code-block-grammar-injection-example). Bundled grammar sources and licenses are recorded in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
