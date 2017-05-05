const JSONAPISerializer = require('jsonapi-serializer').Serializer;
const JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;
const models = require('../models');

/**
 * Determines if the provided model type exists.
 *
 * @param {string} type The model type.
 * @return {boolean}
 */
function exists(type) {
  return models.hasOwnProperty(type);
}

/**
 * Gets all available model types.
 *
 * @return {array}
 */
function getAllTypes() {
  return Object.keys(models);
}

/**
 * Gets the metadata (attributes, relationships, etc) for the provided model type.
 *
 * @param {string} type The model type.
 * @return {object}
 * @throws {Error} If the model type could not be found.
 */
function getMetadataFor(type) {
  if (!exists(type)) {
    throw new Error(`No model exists for type ${type}`);
  }
  return models[type];
}

/**
 * Gets a single relationship metadata object for the provided model type and property key.
 *
 * @param {string} type The model type.
 * @paran {string} key The relationship field key.
 * @return {object}
 */
function getRelationshipFor(type, key) {
  if (!hasRelationship(type, key)) {
    throw new Error(`No ${key} relationship assigned on model ${type}`);
  }
  return getRelationshipsFor(type).find((rel) => {
    return rel.key === key;
  });
}

/**
 * Gets all relationship metadata objects for the provided model type.
 *
 * @param {string} type The model type.
 * @return {array}
 */
function getRelationshipsFor(type) {
  let relationships = [];

  const validTypes = { one: true, many: true };
  const metadata = getMetadataFor(type);

  getRelationshipKeys(type).forEach((key) => {
    const relMeta = metadata.relationships[key];
    if (!relMeta.entity || !validTypes.hasOwnProperty(relMeta.type)) {
      // Invalid relationship metadata.
      return;
    }
    relationships.push({
      key: key,
      type: relMeta.type,
      entity: relMeta.entity
    });
  });
  return relationships;
}

/**
 * Gets all relationship field keys for the provided model type.
 *
 * @param {string} type The model type.
 * @return {array}
 */
function getRelationshipKeys(type) {
  const metadata = getMetadataFor(type);
  if ('object' === typeof metadata.relationships) {
    return Object.keys(metadata.relationships);
  }
  return [];
}

/**
 * Determines if relationship exists for the provided model type and property key.
 *
 * @param {string} type The model type.
 * @paran {string} key The relationship field key.
 * @return {boolean}
 */
function hasRelationship(type, key) {
  return -1 !== getRelationshipKeys(type).indexOf(key);
}

module.exports = {
  getAllTypes: getAllTypes,
  getMetadataFor: getMetadataFor,
  exists: exists,
  getRelationshipFor: getRelationshipFor,
  getRelationshipsFor: getRelationshipsFor,
  getRelationshipKeys: getRelationshipKeys,
  hasRelationship: hasRelationship,
};
