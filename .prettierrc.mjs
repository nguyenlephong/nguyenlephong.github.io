//[prettier](https://prettier.io/docs/en/options)
/** @type {import("prettier").Config} */
const config = {
  semi: true, //Don't add semicolons at the end of statements
  singleQuote: false, // Use single quotes instead of double quotes
  trailingComma: "none", // Add trailing commas wherever possible (all, es5, none)
  jsxBracketSameLine: false, // Put the `>` of a multi-line JSX element at the end of the last line instead of being alone on the next line
  arrowParens: "always", // Include parentheses around a sole arrow function parameter
  printWidth: 80, // Specify the line length that the printer will wrap on
  tabWidth: 2, // Specify the number of spaces per indentation-level
  useTabs: false, // Use spaces instead of tabs
  endOfLine: "auto" // Maintain consistent line endings (auto, lf, crlf)
};
export default config;
