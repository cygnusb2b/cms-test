const Nedb = require('nedb');
const bluebird = require('bluebird');

const collections = {};

module.exports = (type) => {
  if (!Object.prototype.hasOwnProperty.call(collections, type)) {
    collections[type] = bluebird.promisifyAll(new Nedb({ filename: `data/${type}.db`, autoload: true }));
  }
  return collections[type];
};
