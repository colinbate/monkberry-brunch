'use strict';

const Compiler = require('monkberry').Compiler;

class MonkberryCompiler {
  constructor(config) {
    if (!config) config = {};
    const options = config.plugins && config.plugins.monkberry || {};
    options.sourceMaps = !!config.sourceMaps;
    if (options.pattern) {
      this.pattern = options.pattern;
    }
    this.options = options;
  }

  compile(params) {
    const path = params.path;
    const data = params.data;
    const compiler = new Compiler();
    if (this.options.globals) {
      compiler.globals = this.options.globals;
    }
    return new Promise((resolve, reject) => {
      let node;
      const result = {path};
      try {
        node = compiler.compile(path, data);
      } catch (err) {
        return reject(err);
      }

      if (this.options.sourceMaps) {
        const output = node.toStringWithSourceMap();
        output.map.setSourceContent(path, data);
        result.data = output.code;
        result.map = output.map.toString();
      } else {
        result.data = node.toString();
      }

      // Concatenation is broken by trailing comments in files, which occur
      // frequently when comment nodes are lost in the AST.
      result.data += '\n';

      resolve(result);
    });
  }
}

MonkberryCompiler.prototype.brunchPlugin = true;
MonkberryCompiler.prototype.type = 'template';
MonkberryCompiler.prototype.extension = 'monk';

module.exports = MonkberryCompiler;
