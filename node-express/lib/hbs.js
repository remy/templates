const crypto = require('crypto');
const marked = require('marked');
const hbs = require('express-hbs');
const fs = require('fs');

module.exports = hbs;

hbs.registerAsyncHelper('static', function (file, cb) {
  fs.readFile(`${__dirname}/../public/${file}`, 'utf8', (err, content) => {
    cb(new hbs.SafeString(content));
  });
});

hbs.registerHelper('length', s => s.length);

// hbs.registerHelper('ms', s => ms(s - Date.now(), { long: true }));

hbs.registerHelper('set', function (prop, value, options) {
  this[prop] = value;
});

const md5 = (data) => crypto.createHash('md5').update(data).digest('hex');

hbs.registerHelper('options', function (selected, ...data) {
  const opts = data.pop();
  let options = '';
  for (const key of data) {
    if (selected === key) {
      options += `<option selected value="${key}">${key}</option>`;
    } else {
      options += `<option value="${key}">${key}</option>`;
    }
  }
  return new hbs.SafeString(options);
});

hbs.registerHelper('if_empty', function (data, options) {
  const keys = Object.keys(data);
  return keys.length === 0 ? options.fn(this) : options.inverse(this);
});

hbs.registerHelper('marked', function (options) {
  return marked(options.fn(this));
});

hbs.registerHelper('each_sorted', (context, options) => {
  let data = {};

  if (options.data) {
    data = hbs.handlebars.createFrame(options.data);
  }

  return Object.keys(context).sort((a, b) => {
    return countries[a.toUpperCase()].name < countries[b.toUpperCase()].name ? -1 : 1;
  }).map((_, i) => {
    if (data) {
      data.index = i;
    }

    data.key = _;

    return options.fn(context[_], { data });
  }).join('');
});

hbs.registerHelper('avatar', (email, ...rest) => {
  const opts = rest.pop();
  let size = 32;
  if (rest.length) {
    size = rest.shift();
  }

  let img = null;

  if (email) {
    const url = `https://www.gravatar.com/avatar/${md5(email)}?s=${size * 2}`;
    img = `<img height="${size}" width="${size}" class="avatar circle" src="${url}">`;
  }

  if (!img) {
    img = `<img height="${size}" width="${size}" src="/img/tmp-avatar.svg" class="circle green tmp-avatar">`;
  }

  return new hbs.SafeString(img);
});


hbs.registerHelper('upper', s => s.toUpperCase());
hbs.registerHelper('lower', s => s.toLowerCase());

hbs.registerHelper('pcent', s => `${s * 100}%`);

hbs.registerHelper('fixed', (value, ...rest) => {
  const opts = rest.pop();
  const code = (rest.shift() || 'gbp').toUpperCase();
  const ccy = getSymbolFromCurrency(code);
  return ccy + (value / 100).toLocaleString('en-IN', {
    minimumFractionDigits: currencies[code].decimals,
    maximumFractionDigits: currencies[code].decimals,
  });
});

hbs.registerHelper('thou', value => {
  return value.toLocaleString('gb-GB', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
});

hbs.registerHelper('urlFormat', (url, ...args) => {
  const opts = args.pop();
  if (!url.includes('?')) {
    url += '?';
  } else {
    url += '&';
  }
  return url + args.join('&');
});

hbs.registerHelper('dump', data => JSON.stringify(data, null, 2));

hbs.registerHelper('sort', (data, prop, options) => {
  return options.fn(data.sort((a, b) => {
    return a[prop] < b[prop] ? -1 : 1;
  }));
});

hbs.registerHelper('first_non_false', (data, options) => options.fn(data.find(Boolean)))

hbs.registerHelper('if_eq', function (a, b, opts) {
  return (a === b) ? opts.fn(this) : opts.inverse(this);
});

hbs.registerHelper('if_ne', function (a, b, opts) {
  return (a != b) ? opts.fn(this) : opts.inverse(this);
});

hbs.registerHelper('if_all', function () { // important: not an arrow fn
  const args = [].slice.call(arguments);
  const opts = args.pop();

  return args.every(v => !!v) ? opts.fn(this) : opts.inverse(this);
});

hbs.registerHelper('if_any', function (...args) { // important: not an arrow fn
  const opts = args.pop();

  return args.some(v => !!v) ? opts.fn(this) : opts.inverse(this);
});

hbs.registerHelper('unless_eq', (a, b, opts) => {
  return (a !== b) ? opts.fn(this) : opts.inverse(this);
});

hbs.registerHelper('if', function (v1, operator, v2, options) {
  switch (operator) {
    case '==': {
      return (v1 == v2) ? options.fn(this) // jshint ignore:line
                        : options.inverse(this);
    }
    case '===': {
      return (v1 === v2) ? options.fn(this) : options.inverse(this);
    }
    case '<': {
      return (v1 < v2) ? options.fn(this) : options.inverse(this);
    }
    case '<=': {
      return (v1 <= v2) ? options.fn(this) : options.inverse(this);
    }
    case '>': {
      return (v1 > v2) ? options.fn(this) : options.inverse(this);
    }
    case '>=': {
      return (v1 >= v2) ? options.fn(this) : options.inverse(this);
    }
    case '&&': {
      return (v1 && v2) ? options.fn(this) : options.inverse(this);
    }
    case '||': {
      return (v1 || v2) ? options.fn(this) : options.inverse(this);
    }
    default: {
      return options.inverse(this);
    }
  }
});

// TODO remember to check if these actually work (and then remove the above)
hbs.registerHelper({
  eq: (v1, v2) => v1 === v2,
  ne: (v1, v2) => v1 !== v2,
  lt: (v1, v2) => v1 < v2,
  gt: (v1, v2) => v1 > v2,
  lte: (v1, v2) => v1 <= v2,
  gte: (v1, v2) => v1 >= v2,
  and: (v1, v2) => v1 && v2,
  or: (v1, v2) => v1 || v2,
  not: (v) => !v,
});

hbs.registerHelper('encode', encodeURIComponent);

hbs.registerHelper('json', JSON.stringify.bind(JSON));

hbs.registerHelper('math', function (left, operator, right) {
  left = parseFloat(left, 10);
  right = parseFloat(right, 10);

  return {
    '+': left + right,
    '-': left - right,
    '*': left * right,
    '/': left / right,
    '%': left % right,
  }[operator];
});

// usage: {{pluralize collection.length 'quiz' 'quizzes'}}
hbs.registerHelper('pluralize', function (number, single, plural) {
  return (number === 1) ? single : plural;
});

hbs.registerHelper('slice', (value, i, len) => (value+'').slice(i, len));

hbs.registerHelper('cli', c => {
  return {
    green: '\033[32m',
    red: '\033[33m',
    reset: '\033[0m',
  }[c]
});