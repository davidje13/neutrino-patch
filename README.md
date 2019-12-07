# Neutrino Patch

Adds simple methods to Neutrino to make managing configuration easier.

## Install dependency

```bash
npm install --save git+https://github.com/davidje13/neutrino-patch#semver:^1.0.2
```

## Usage

```javascript
const applyNeutrinoPatches = require('neutrino-patch');

const myMiddleware = () => (neutrino) => {
  applyNeutrinoPatches(neutrino);

  // adds extensions 'abc' and 'xyz' at end of list (lowest priority)
  neutrino.addSupportedExtensions('abc', 'xyz');

  // adds extensions 'yay' and 'woo' immediately before 'js' (higher priority)
  // (or at end of list if 'js' is not found)
  neutrino.addSupportedExtensionsBefore('js', 'yay', 'woo');

  // add a preset to the babel compile stage
  // (whether it has already been defined or not)
  neutrino.tapAtEnd('compile', 'babel', (options) => {
    options.presets.push(['@babel/some-preset-here', {}]);
    return options;
  });
};
```
