'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _entries = require('babel-runtime/core-js/object/entries');

var _entries2 = _interopRequireDefault(_entries);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Block = function () {
  function Block() {
    (0, _classCallCheck3.default)(this, Block);

    this.instance = arguments.length <= 0 ? undefined : arguments[0];
  }

  (0, _createClass3.default)(Block, [{
    key: 'enableLog',
    value: function enableLog(logfile) {
      this.logger = new _winston2.default.Logger({
        transports: [new _winston2.default.transports.File({ filename: logfile })]
      });
    }
  }, {
    key: 'disableLog',
    value: function disableLog() {
      this.logger = null;
    }
  }, {
    key: 'log',
    value: function log(level, message) {
      if (!this.logger) {
        return;
      }
      this.logger.log(level, message);
    }
  }, {
    key: 'update',
    value: function update() {
      var _this = this;

      return new _bluebird2.default(function (resolve, reject) {
        _this.generate(resolve, reject);
      });
    }
  }, {
    key: 'generate',
    value: function generate(succeed, fail) {
      var output = Block.separator + Block.pango({
        body: '[NOT IMPLEMENTED]',
        markup: {
          color: Block.colors.nok
        }
      });
      if (!this.badcondition) {
        succeed(output);
      } else {
        fail('failed');
      }
    }
  }, {
    key: 'echo',
    value: function echo() {
      var _this2 = this;

      this.update().then(function (result) {
        console.log(result);
      }).catch(function (error) {
        console.log(Block.pango({
          body: _this2.instance + ' failed',
          markup: {
            background: Block.colors.nok
          }
        }));
        _this2.log('error', error);
      });
    }
  }, {
    key: 'persistent',
    value: function persistent(delay) {
      var _this3 = this;

      setInterval(function () {
        _this3.echo();
      }, delay);
    }
  }]);
  return Block;
}();

Block.colors = {
  ok: '#b5bd68',
  nok: '#cc6666',
  fg: '#cccccc'
};

Block.pango = function (options) {
  function doPango(option) {
    var str = [];
    if (option.separator) {
      str.push(Block.separator);
    }
    str.push('<span');
    if (option.markup) {
      (0, _entries2.default)(option.markup).forEach(function (entry) {
        if (entry[1]) {
          str.push(' ' + entry[0] + '=\'' + entry[1] + '\'');
        }
      });
    }
    str.push('>' + option.body + '</span>');
    return str.join('');
  }

  if (options instanceof Array) {
    var multi = [];
    for (var i = 0; i < options.length; i++) {
      multi.push(doPango(options[i]));
    }
    return multi.join('');
  }

  return doPango(options);
};

Block.separator = Block.pango({
  body: ' ',
  markup: {
    font: 10,
    color: Block.colors.fg
  }
});
exports.default = Block;