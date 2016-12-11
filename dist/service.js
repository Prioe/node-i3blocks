'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _childProcessPromise = require('child-process-promise');

var _block = require('./lib/block');

var _block2 = _interopRequireDefault(_block);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var stateColors = {
  loaded: {
    running: 'green',
    dead: 'white',
    failed: 'red'
  },
  'not-found': {
    dead: 'red'
  }
};

function parseSystemctlShow(data) {
  var result = {};
  data.split('\n').forEach(function (line) {
    var pair = line.split('=');
    if (pair[1]) {
      var value = void 0;
      var key = function (string) {
        return string.charAt(0).toLowerCase() + string.substr(1);
      }(pair[0]);
      switch (pair[1]) {
        case 'yes':
          value = true;
          break;
        case 'no':
          value = false;
          break;
        case '0':
          value = 0;
          break;
        default:
          value = Number(pair[1]) || pair[1];
      }
      result[key] = value;
    }
  });
  return result;
}

var ServiceBlock = function (_Block) {
  (0, _inherits3.default)(ServiceBlock, _Block);

  function ServiceBlock() {
    var _ref;

    (0, _classCallCheck3.default)(this, ServiceBlock);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var _this = (0, _possibleConstructorReturn3.default)(this, (_ref = ServiceBlock.__proto__ || (0, _getPrototypeOf2.default)(ServiceBlock)).call.apply(_ref, [this].concat(args)));

    _this.target = args[1] + '.service';
    return _this;
  }

  (0, _createClass3.default)(ServiceBlock, [{
    key: 'generate',
    value: function generate(succeed, fail) {
      (0, _childProcessPromise.exec)('systemctl show ' + this.target).then(function (result) {
        var status = parseSystemctlShow(result.stdout);
        var message = _block2.default.pango([/* {
                                             body: status.id.charAt(0).toUpperCase(),
                                             },*/{
          body: '●',
          markup: {
            color: stateColors[status.loadState][status.subState] || 'pink'
          }
        }]);
        succeed(message);
      }).catch(fail);
    }
  }]);
  return ServiceBlock;
}(_block2.default);

exports.default = ServiceBlock;