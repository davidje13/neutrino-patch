function patchMethod(o, methodName, replacement) {
  if (!o[methodName].patched) {
    const original = o[methodName].bind(o);
    o[methodName] = replacement.bind(o, original);
    o[methodName].patched = true;
  }
  return o;
}

function applyNeutrinoPatches(neutrino) {
  if (neutrino.tapAtEnd) {
    return;
  }

  neutrino.ruleInterceptors = [];
  neutrino.runningInterceptors = false;
  neutrino.tapAtEnd = (rule, use, fn) => {
    neutrino.ruleInterceptors.push([rule, use, fn]);
  };

  neutrino.addSupportedExtensionsBefore = (search, ...exts) => {
    const { extensions } = neutrino.options;
    let index = extensions.indexOf(search);
    if (index === -1) {
      index = extensions.length;
    }
    extensions.splice(index, 0, ...exts);
    neutrino.options.extensions = extensions;
  }

  neutrino.addSupportedExtensions = (...exts) => {
    neutrino.addSupportedExtensionsBefore(null, ...exts);
  }

  patchMethod(neutrino.config.module, 'rule', (originalRule, ruleName) => {
    return patchMethod(originalRule(ruleName), 'use', (originalUse, useName) => {
      const use = originalUse(useName);
      const intercept = () => {
        if (neutrino.runningInterceptors) {
          return;
        }

        neutrino.runningInterceptors = true;
        neutrino.ruleInterceptors.forEach(([r, u, fn]) => {
          if (r === ruleName && u === useName) {
            use.tap(fn);
          }
        });
        neutrino.ruleInterceptors = neutrino.ruleInterceptors
          .filter(([r, u]) => (r !== ruleName || u !== useName));
        neutrino.runningInterceptors = false;
      };

      patchMethod(use, 'get', (originalGet, getName) => {
        intercept();
        return originalGet(getName);
      });
      patchMethod(use, 'order', (originalOrder) => {
        intercept();
        return originalOrder();
      });
      return use;
    });
  });
}

module.exports = applyNeutrinoPatches;
