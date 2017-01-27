* v0.0.6
  * Correct sorting of using lines with chars in different cases (like "S" and "s").
  * "csharpfixformat.indentPreprocessor" option was added.
    > Indent preprocessor defines or put them without indentation. Disable by default.
* v0.0.5
  * Switch-case indentation fixed.
* v0.0.4
  * Comment skipping. Dont use tail comments at using line - they will be removed!
  No limits for other places for tail comments.
  * Indent of wrapped lines with not finished assign expression should be fixed.
* v0.0.3
  * "Sort usings" command renamed to "Fix format".
  * "csharpfixformat.indentEnabled" option was added.
    > Indent all lines with respect of parentheses / braces and use "editor.tabSize" parameter. Enabled by default.
  * "csharpfixformat.emptyLinesInRowLimit" option was added.
    > Amount of empty lines in row, negative value for disable. By default 1 empty line allowed between expressions.
  * Sort usings should works correctly for multiple using expressions in line.
  * Sort usings should ignore commented expressions (if usings put at begining of each line inside multiline comment - they will be sorted).
  * Refactoring.
* v0.0.2
  * Debug logging removed.
  * Refactoring.
* v0.0.1
  * Init release.