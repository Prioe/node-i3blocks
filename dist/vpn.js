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

var _publicIp = require('public-ip');

var _publicIp2 = _interopRequireDefault(_publicIp);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _geolib = require('geolib');

var _geolib2 = _interopRequireDefault(_geolib);

var _block = require('./lib/block');

var _block2 = _interopRequireDefault(_block);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function format(ok, symbol, ip, info) {
  return _block2.default.pango([{
    body: info,
    separator: true,
    markup: {
      color: !ok && _block2.default.colors.nok
    }
  }, {
    body: ' ' + symbol + ' ',
    markup: {
      color: ok ? _block2.default.colors.ok : _block2.default.colors.nok
    }
  }, {
    body: ip
  }]);
}
function checkVpn(iface) {
  return (0, _childProcessPromise.exec)('ip link show dev ' + iface).then(function () {
    return true;
  }).catch(function () {
    return false;
  });
}

function resolveIp() {
  return _publicIp2.default.v4().then(function (ip) {
    return (0, _requestPromise2.default)('http://freegeoip.net/json/' + ip).then(function (result) {
      return JSON.parse(result);
    });
  });
}

function parseGeodata(geodata, home, threshold) {
  var distance = _geolib2.default.getDistance(home, { latitude: geodata.latitude, longitude: geodata.longitude });
  return {
    ok: distance > threshold,
    location: geodata.region_name || geodata.country_name,
    distance: Number((distance / 1000).toFixed(2))
  };
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

    _this.options = ServiceBlock.defaults;
    return _this;
  }

  (0, _createClass3.default)(ServiceBlock, [{
    key: 'generate',
    value: function generate(succeed, fail) {
      var _this2 = this;

      checkVpn(this.options.vpnInterface).then(function (vpnRunning) {
        resolveIp().then(function (result) {
          var geodata = parseGeodata(result, _this2.options.home, _this2.options.threshold);
          var status = format(vpnRunning && geodata.ok, vpnRunning ? _this2.options.symbols.vpn : _this2.options.symbols.novpn, result.ip, geodata.ok ? geodata.location : '');
          succeed(status);
        });
      }).catch(fail);
    }
  }]);
  return ServiceBlock;
}(_block2.default);

ServiceBlock.defaults = {
  home: { latitude: 48.142952, longitude: 11.577358 },
  threshold: 100000,
  vpnInterface: 'tun0',
  symbols: {
    vpn: '',
    novpn: ''
  }
};
exports.default = ServiceBlock;