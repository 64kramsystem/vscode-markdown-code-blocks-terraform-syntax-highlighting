# Markdown Terraform Code Block Highlighting

Highlights `tf` and `terraform` fenced code blocks in the VS Code Markdown editor and built-in Markdown Preview. Fence names are case-insensitive; backticks and tildes are supported, including blocks in lists and blockquotes.

````markdown
```tf
resource "aws_instance" "example" {
  ami = var.ami_id
}
```
````

The HashiCorp Terraform syntax grammar is bundled. No additional extensions are required. Preview highlighting uses bundled VS Code TextMate and Oniguruma components; nothing is downloaded at runtime. Requires desktop VS Code 1.141 or later; vscode.dev and github.dev are not supported.

This extension provides syntax highlighting in the editor and preview, without language-server features. It does not associate itself with standalone `.tf` files.

## Development

Run `npm ci` and `npm test` to test editor highlighting and rendered preview HTML. Run `npm run build` before launching the extension with F5. Development dependencies are excluded from the extension package.

## Credits

Based on [Matt Bierner's Markdown grammar injection example](https://github.com/mjbvz/vscode-fenced-code-block-grammar-injection-example). Bundled grammar sources and licenses are recorded in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
