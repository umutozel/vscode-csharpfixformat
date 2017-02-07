# CSharpFixFormat for Visual Studio Code
This extension helps to format C# code. When OmniSharp will support all features - will be deprecated.

## Features
All features available through commands menu, context menu in text editor with option "CSharp: Fix format" or through keybinding "ctrl+alt+i".
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
* `csharpfixformat.style.activateDefaultFormatterAfter`: Should default code formatter be activated as post process. False by default.
* `csharpfixformat.style.braces.onSameLine`: Should open braces be kept on expression line (K&R style) or on new line. True by default.
* `csharpfixformat.style.braces.allowInlines`: Allow expressions inside braces at one line. True by default.
* `csharpfixformat.style.spaces.beforeParenthesis`: Space before '(' - opening parenthesis. True by default.
* `csharpfixformat.style.spaces.beforeBracket`: Space before '[' - opening bracket. True by default.
* `csharpfixformat.style.spaces.insideEmptyParenthis`: Space inside '()' - empty parenthis. False by default.
* `csharpfixformat.style.spaces.insideEmptyBraces`: Space inside '{}' - empty braces. True by default.
* `csharpfixformat.style.spaces.insideEmptyBrackets`: Space inside '[]' - empty brackets. False by default.