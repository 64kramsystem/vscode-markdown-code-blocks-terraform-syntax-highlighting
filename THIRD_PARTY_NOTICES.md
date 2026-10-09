# Third-party notices

## Bundled Terraform grammar

`syntaxes/terraform.tmGrammar.json` comes from [HashiCorp.terraform 2.40.0](https://github.com/hashicorp/vscode-terraform), distributed by the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=HashiCorp.terraform). The grammar originates in [hashicorp/syntax 0.7.1](https://github.com/hashicorp/syntax/tree/v0.7.1). Original package path: `extension/syntaxes/terraform.tmGrammar.json`. Original file SHA-256: `63b2c259398559c41e6479ef016a85eb345eab0bcee207064d06ae4332961344`.

Modifications: JSON formatting is normalized; line-start anchors also accept the position after Markdown list/quote prefixes (`\G`); the root scope is renamed from `source.hcl.terraform` to `source.markdown-code-blocks.terraform` to avoid conflicting with other extensions. All token scopes are preserved. The grammar is shipped in source form under MPL-2.0; see [the upstream license](licenses/terraform-MPL-2.0.txt). Other extension files remain under the root MIT [LICENSE](LICENSE).

To update the grammar, copy that file from a reviewed upstream release, apply the same scope rename and line-start anchor adaptations, refresh its version and SHA-256 here, preserve its license, and run `npm test`.

## Test fixture

`test/fixtures/markdown.tmLanguage.json` is copied unchanged from [VS Code 1.141.0](https://github.com/microsoft/vscode/blob/1.141.0/extensions/markdown-basics/syntaxes/markdown.tmLanguage.json), under the MIT license in `test/fixtures/LICENSE.txt`. Test fixtures are excluded from the extension package.

## Preview tokenizer

The preview bundles [vscode-textmate 9.3.2](https://github.com/microsoft/vscode-textmate) and [vscode-oniguruma 2.0.1](https://github.com/microsoft/vscode-oniguruma), both MIT-licensed. Their licenses and Oniguruma’s bundled BSD license notice are preserved in `licenses/textmate-MIT.txt`, `licenses/vscode-oniguruma-MIT.txt`, and `licenses/oniguruma-NOTICES.txt`.
