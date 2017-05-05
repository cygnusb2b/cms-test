const nedb = require('nedb');

let collections = {};

module.exports = (type) => {
  if (!collections.hasOwnProperty(type)) {
    collections[type] = new nedb({ filename: `data/${type}.db`, autoload: true });
  }
  return collections[type];
};
