java -jar FileMerger.jar public_html\js obfuscate\out.js
java -jar yuicompressor-2.4.8.jar -o obfuscate\action.js obfuscate\out.js
DEL obfuscate\out.js