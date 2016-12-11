import { exec } from 'child-process-promise';
import publicIp from 'public-ip';
import request from 'request-promise';
import geolib from 'geolib';

import Block from './lib/block';

function format(ok, symbol, ip, info) {
  return Block.pango([{
    body: info,
    separator: true,
    markup: {
      color: !ok && Block.colors.nok,
    },
  }, {
    body: ` ${symbol} `,
    markup: {
      color: ok ? Block.colors.ok : Block.colors.nok,
    },
  }, {
    body: ip,
  }]);
}
function checkVpn(iface) {
  return exec(`ip link show dev ${iface}`).then(() => true).catch(() => false);
}

function resolveIp() {
  return publicIp.v4().then(ip => request(`http://freegeoip.net/json/${ip}`).then(result => JSON.parse(result)));
}

function parseGeodata(geodata, home, threshold) {
  const distance = geolib.getDistance(
    home,
    { latitude: geodata.latitude, longitude: geodata.longitude },
  );
  return {
    ok: distance > threshold,
    location: geodata.region_name || geodata.country_name,
    distance: Number((distance / 1000).toFixed(2)),
  };
}

export default class ServiceBlock extends Block {
  static defaults = {
    home: { latitude: 48.142952, longitude: 11.577358 },
    threshold: 100000,
    vpnInterface: 'tun0',
    symbols: {
      vpn: '',
      novpn: '',
    },
  }

  constructor(...args) {
    super(...args);
    this.options = ServiceBlock.defaults;
  }

  generate(succeed, fail) {
    checkVpn(this.options.vpnInterface).then((vpnRunning) => {
      resolveIp().then((result) => {
        const geodata = parseGeodata(result, this.options.home, this.options.threshold);
        const status = format(
          vpnRunning && geodata.ok,
          vpnRunning ? this.options.symbols.vpn : this.options.symbols.novpn,
          result.ip,
          geodata.ok ? geodata.location : '',
        );
        succeed(status);
      });
    }).catch(fail);
  }
}
