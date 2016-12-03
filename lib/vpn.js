import publicIp from 'public-ip';
import geoIp from 'geoip-lite';

publicIp.v4().then((ip) => {
  console.log(geoIp.lookup(ip));
});
