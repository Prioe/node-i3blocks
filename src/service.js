import { exec } from 'child-process-promise';
import Block from './lib/block';

const stateColors = {
  loaded: {
    running: 'green',
    dead: 'white',
    failed: 'red',
  },
  'not-found': {
    dead: 'red',
  },
};

function parseSystemctlShow(data) {
  const result = {};
  data.split('\n').forEach((line) => {
    const pair = line.split('=');
    if (pair[1]) {
      let value;
      const key = (string => string.charAt(0).toLowerCase() + string.substr(1))(pair[0]);
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

export default class ServiceBlock extends Block {
  constructor(...args) {
    super(...args);
    this.target = `${args[1]}.service`;
  }
  generate(succeed, fail) {
    exec(`systemctl show ${this.target}`).then((result) => {
      const status = parseSystemctlShow(result.stdout);
      const message = Block.pango([/* {
        body: status.id.charAt(0).toUpperCase(),
        },*/ {
          body: '●',
          markup: {
            color: stateColors[status.loadState][status.subState] || 'pink',
          },
        }]);
      succeed(message);
    }).catch(fail);
  }
}
