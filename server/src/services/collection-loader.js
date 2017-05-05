const Nedb = require('nedb');

const collections = {};

module.exports = (type) => {
  if (!Object.prototype.hasOwnProperty.call(collections, type)) {
    collections[type] = new Nedb({ filename: `data/${type}.db`, autoload: true });
  }
  return collections[type];
};
