const JSONAPISerializer = require('jsonapi-serializer').Serializer;
const JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;
const modelManager = require('./model-manager');
const path = require('path');

/**
 * Applies relationship data from a deserialized request payload
 * to the object to be persisted in the database.
 *
 * @param {string} type The model type.
 * @param {object} data The deserialized request payload.
 * @param {object} applyTo The object to apply the data to.
 */
function applyRelationshipData(type, data, applyTo) {
  let cloned = Object.assign({}, data);

  modelManager.getRelationshipsFor(type).forEach((rel) => {
    const key = rel.key;
    if (typeof cloned[key] === 'undefined') {
      return;
    }
    let value = cloned[key];
    if (rel.type === 'many') {
      applyTo[key] = [];
      if (Array.isArray(value)) {
        value.forEach((id) => {
          if (id) {
            applyTo[key].push(id);
          }
        });
      } else if (value) {
        applyTo[key].push(value);
      }
    } else {
      applyTo[key] = null;
      if (Array.isArray(value)) {
        value = value.shift();
      }
      if (value) {
        applyTo[key] = value;
      }
    }
  });
}

/**
 * Creates a link for use in the serialized API response.
 *
 * @param {object} req The express request object.
 * @param {string} p The path to append.
 * @return {string}
 */
function createLink(req, p) {
  return `${req.protocol}:\/\/${req.get('host')}${path.join('/api', p)}`;
}

/**
 * Gets a JSON API deserializer instance for the provided model type.
 *
 * @param {string} type The model type.
 * @return {JSONAPIDeserializer}
 */
function getDeserializerFor(type) {
  const metadata = modelManager.getMetadataFor(type);
  let options = {
    keyForAttribute: 'camelCase', // @todo Make configurable?
  };

  modelManager.getRelationshipsFor(type).forEach((relMeta) => {
    options[relMeta.entity] = {
      valueForRelationship: (model) => {
        return { id: model.id, type: model.type };
      },
    };
  });
  return new JSONAPIDeserializer(options);
}

/**
 * Gets a JSON API serializer instance for the provided model type.
 *
 * @param {object} req The express request object.
 * @param {string} type The model type.
 * @return {JSONAPISerializer}
 */
function getSerializerFor(type, req) {
  const metadata = modelManager.getMetadataFor(type);
  let options = {
    id: '_id', // @todo Makes an assumption about the ID type... should not be hardcoded.
    attributes: metadata.attributes.slice(), // Clone the attrs, as the serializer will modify them.
    keyForAttribute: 'camelCase', // @todo Make configurable?
    typeForAttribute: (attribute, data) => {
      return data.type;
    },
    topLevelLinks: {
      self: createLink(req, req.path),
    },
    dataLinks: {
      self: (data, model) => {
        return createLink(req, `${type}/${model._id}`);
      }
    },
  };

  modelManager.getRelationshipsFor(type).forEach((relMeta) => {
    options.attributes.push(relMeta.key);
    options[relMeta.key] = {
      ref: (model, value) => {
        return (value) ? value.id : null;
      },
      relationshipLinks: {
        self: (record, current, parent) => {
          return createLink(req, `${type}/${parent.id}/relationships/${relMeta.key}`);
        },
        related:(record, current, parent) => {
          return createLink(req, `${type}/${parent.id}/${relMeta.key}`);
        },
      },
    };
  });

  options.transform = (record) => {
    let cloned = Object.assign({}, record);

    // Remove all null values from the record to prevent them
    // from appearing in the serialized result.
    Object.keys(cloned).forEach((attr) => {
      if (null === cloned[attr]) {
        delete cloned[attr];
      }
    });
    return cloned;
  };
  return new JSONAPISerializer(type, options);
}

module.exports = {
  applyRelationshipData: applyRelationshipData,
  createLink: createLink,
  getDeserializerFor: getDeserializerFor,
  getSerializerFor: getSerializerFor,
};
