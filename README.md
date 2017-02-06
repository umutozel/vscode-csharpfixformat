# CSharpFixFormat for Visual Studio Code
This extension helps to format C# code. When OmniSharp will support all features - will be deprecated.

## Features
All features available through commands menu or context menu in text editor with option "CSharp: Fix format".
  * Sort usings in alphabetical order at opened C# file. Doubles will be removed automatically.
  * Fix indent size for all lines (omnisharp still cant do it for wrapped lines).
  * Cleanup empty lines with allowed limit in row.

## Extension Settings

* `csharpfixformat.sort.usings.enabled`: Should usings be sorted or not. True by default.
* `csharpfixformat.sort.usings.systemFirst`: Put System.xxx namespaces first at usings list on sorting. True by default.
* `csharpfixformat.sort.usings.splitGroups`: Insert blank line between using blocks grouped by first part of namespace. False by default.
* `csharpfixformat.style.enabled`: Enable code reformat with style options. True by default.
* `csharpfixformat.style.newline.maxAmount`: Amount of new line (\\n) symbols allowed in row. 1 means no blank lines, 0 for disable. 2 by default.
* `csharpfixformat.style.indent.preprocessorIgnored`: Should preprocessor directives ignore indentation or use it. True by default.