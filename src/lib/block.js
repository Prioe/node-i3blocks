import Promise from 'bluebird';
import winston from 'winston';

export default class Block {
  static colors = {
    ok: '#b5bd68',
    nok: '#cc6666',
    fg: '#cccccc',
  }
  static pango = (options) => {
    function doPango(option) {
      const str = [];
      if (option.separator) {
        str.push(Block.separator);
      }
      str.push('<span');
      if (option.markup) {
        Object.entries(option.markup).forEach((entry) => {
          if (entry[1]) {
            str.push(` ${entry[0]}='${entry[1]}'`);
          }
        });
      }
      str.push(`>${option.body}</span>`);
      return str.join('');
    }

    if (options instanceof Array) {
      const multi = [];
      for (let i = 0; i < options.length; i++) {
        multi.push(doPango(options[i]));
      }
      return multi.join('');
    }

    return doPango(options);
  }

  static separator = Block.pango({
    body: ' ',
    markup: {
      font: 10,
      color: Block.colors.fg,
    },
  })

  constructor(...args) {
    this.instance = args[0];
  }

  enableLog(logfile) {
    this.logger = new (winston.Logger)({
      transports: [
        new (winston.transports.File)({ filename: logfile }),
      ],
    });
  }

  disableLog() {
    this.logger = null;
  }

  log(level, message) {
    if (!this.logger) {
      return;
    }
    this.logger.log(level, message);
  }

  update() {
    return new Promise((resolve, reject) => {
      this.generate(resolve, reject);
    });
  }

  generate(succeed, fail) {
    const output = Block.separator + Block.pango({
      body: '[NOT IMPLEMENTED]',
      markup: {
        color: Block.colors.nok,
      },
    });
    if (!this.badcondition) {
      succeed(output);
    } else {
      fail('failed');
    }
  }

  echo() {
    this.update().then((result) => {
      console.log(result);
    }).catch((error) => {
      console.log(Block.pango({
        body: `${this.instance} failed`,
        markup: {
          background: Block.colors.nok,
        },
      }));
      this.log('error', error);
    });
  }

  persistent(delay) {
    setInterval(() => {
      this.echo();
    }, delay);
  }

}
