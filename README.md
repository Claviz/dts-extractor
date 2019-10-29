# dts-extractor [![Build Status](https://travis-ci.org/Claviz/dts-extractor.svg?branch=master)](https://travis-ci.org/Claviz/dts-extractor) [![codecov](https://codecov.io/gh/Claviz/dts-extractor/branch/master/graph/badge.svg)](https://codecov.io/gh/Claviz/dts-extractor) ![npm](https://img.shields.io/npm/v/dts-extractor.svg)

Extract definition files from local node modules.

## Installation & Usage

`npm install dts-extractor`

Usage:

```js
const dtsExtractor = require('dts-extractor');

(async () => {
    const dts = await dtsExtractor.getDts({
        nodeModulesPath: './node_modules', // path in file system where packages located
        packages: ['xlstream', '@types/moment'], // list of packages 
    });
})();
```

### Usage with Monaco Editor

One of the use-cases for this package is to supply custom typings for Monaco Editor. When typings are extracted as shown in the code snippet above, they can be plugged in to Monaco Editor:
```js
for (const key of Object.keys(dts)) {
    monaco.languages.typescript.typescriptDefaults.addExtraLib(dts[key], key);
}
```
In result, IntelliSense will be enabled for desired packages:
![monaco-editor-intellisense](https://i.imgur.com/Er5DazL.gif)