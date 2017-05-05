const express = require('express');
const router = express.Router();
const httpError = require('http-errors');

const loadCollection = require('./services/collection-loader');
const modelManager = require('./services/model-manager');
const adapter = require('./services/api-adapter');

/**
 * Finds a model by ID, or returns an error to the callback if not found.
 *
 * @param {object} collection The model collection.
 * @param {string} id The model identifier.
 * @param {function} cb The error/result callback function.
 */
function findById(collection, id, cb) {
  collection.findOne({ _id: id }, (err, doc) => {
    if (err) {
      cb(err);
    } else if (!doc) {
      cb(httpError(404, `No record found for ID: ${id}`));
    } else {
      cb(null, doc);
    }
  });
};

/**
 * Validates the API request payload.
 * Will return an error to the callback if the payload is invliad.
 *
 * @param {object} payload The request payload.
 * @param {function} cb The error/result callback function.
 */
function validatePayload(payload, cb) {
  if (!payload.data) {
    cb(new Error('No data member was found in the request.'));
  } else if (!payload.data.type) {
    cb(new Error('All data payloads must contain the `type` member.'));
  } else {
    cb(null, true);
  }
};

/**
 * Validates that the provided model type exists.
 * Will return an error to the callback if the model type is not registered.
 *
 * @param {string} type The model type (in plural form).
 * @param {function} cb The error/result callback function.
 */
function validateType(type, cb) {
  if (!modelManager.exists(type)) {
    cb(httpError(404, `No API resource exists for type: ${type}`));
  } else {
    cb(null, true);
  }
};

/**
 * Routes for listing all resources.
 */
router.get('/', (req, res) => {
  let resources = {};
  modelManager.getAllTypes().forEach((type) => {
    resources[type] = adapter.createLink(req, type);
  });
  res.json(resources);
});

/**
 * Root resource routes.
 */
router.route('/:type')
  /**
   * The retrieve/list all route.
   */
  .get((req, res, next) => {
    const type = req.params.type;
    validateType(type, (err) => {
      if (err) {
        return next(err);
      }
      loadCollection(type).find({}, (err, records) => {
        if (err) {
          return next(err);
        }
        const serializer = adapter.getSerializerFor(type, req);
        res.json(serializer.serialize(records));
      });
    });
  })

  /**
   * The create route.
   */
  .post((req, res, next) => {
    const type = req.params.type;
    const payload = req.body;
    validateType(type, (err) => {
      if (err) {
        return next(err);
      }
      validatePayload(payload, (err, valid) => {
        if (err) {
          return next(httpError(400, err));
        }
        if (payload.data.id) {
          return next(httpError(400, 'Client generated IDs is not supported. Remove the `id` member and try again.'));
        }

        const type = payload.data.type;
        const deserializer = adapter.getDeserializerFor(type);

        deserializer.deserialize(payload, (err, data) => {
          if (err) {
            return next(err);
          }

          const metadata = modelManager.getMetadataFor(type);
          let toInsert = {};
          metadata.attributes.forEach(attr => {
            toInsert[attr] = data[attr] || null
          });

          adapter.applyRelationshipData(type, data, toInsert);

          const collection = loadCollection(type);
          collection.insert(toInsert, (err, record) => {
            if (err) {
              return next(err);
            }
            const serializer = adapter.getSerializerFor(type, req);
            res.json(serializer.serialize(record));
          });
        });
      });
    });
  })
;

/**
 * Single model routes.
 */
router.route('/:type/:id')
  /**
   * The retrieve route.
   */
  .get((req, res, next) => {
    const type = req.params.type;
    validateType(type, (err) => {
      if (err) {
        return next(err);
      }
      const collection = loadCollection(type);
      findById(collection, req.params.id, (err, record) => {
        if (err) {
          return next(err);
        }
        const serializer = adapter.getSerializerFor(type, req);
        res.json(serializer.serialize(record));
      });
    });
  })

  /**
   * The delete route.
   */
  .delete((req, res, next) => {
    const type = req.params.type;
    validateType(type, (err) => {
      if (err) {
        return next(err);
      }
      const collection = loadCollection(type);
      findById(collection, req.params.id, (err) => {
        // Ensure the record exists before deleting it.
        if (err) {
          return next(err);
        }
        collection.remove({ _id: req.params.id }, (err) => {
          if (err) {
            return next(err);
          }
          res.status(204).send()
        });
      });
    });
  })

  /**
   * The update route.
   */
  .patch((req, res, next) => {
    const payload = req.body;
    validatePayload(payload, (err, valid) => {
      if (err) {
        return next(httpError(400, err));
      }
      if (!payload.data.id) {
        return next(httpError(400, 'All update requests must contain the `id` member.'));
      }
      if (payload.data.id !== req.params.id) {
        return next(httpError(400, 'The ID found in the request URI does not match the value of the `id` member.'));
      }

      const type = payload.data.type;
      const deserializer = adapter.getDeserializerFor(type);

      deserializer.deserialize(payload, (err, data) => {
        if (err) {
          return next(err);
        }
        let toUpdate = {};
        const metadata = modelManager.getMetadataFor(type);
        metadata.attributes.forEach((attr) => {
          if (typeof data[attr] !== 'undefined') {
            toUpdate[attr] = data[attr] || null;
          }
        });

        adapter.applyRelationshipData(type, data, toUpdate);

        const collection = loadCollection(type);
        collection.update({ _id: payload.data.id }, { $set: toUpdate }, (err) => {
          if (err) {
            return next(err);
          }
          findById(collection, payload.data.id, (err, record) => {
            if (err) {
              next(err);
            } else {
              const serializer = adapter.getSerializerFor(type, req);
              res.json(serializer.serialize(record));
            }
          });
        });
      });
    });
  })
;

/**
 * Relationship routes: currently disabled/not-implemented.
 */
router.route('/:type/:id/relationships/:key')
  .get((req, res, next) => {
    const type = req.params.type;
    const key = req.params.key;
    validateType(type, (err) => {
      if (err) {
        return next(err);
      }
      if (!modelManager.hasRelationship(type, key)) {
        return next(httpError(400, `The relationship '${key}' does not exists on model '${type}'`));
      }

      // Find the owning record.
      const collection = loadCollection(type);
      findById(collection, req.params.id, (err, record) => {
        if (err) {
          return next(err);
        }
        const rel = modelManager.getRelationshipFor(type, key);
        // @todo Must determine HOW the rel should be saved in the database.
        // The default { id: "", type: "" } format is probably fine, however
        // we would need the ability to munge this hash for different schemas.
        // By always keeping a type, we could (but should we?) support a
        // relationships where ANY model type (or multiple, disparate model types)
        // could be related.
        // For now, this assumes that multiple model types are NOT supported.
        // The persistence side would need to enforce the rules about what can
        // and cannot be saved.

        // @todo This is now forced to use JSON:API format all the time.
        // Likely, the entire routing structure should be a part of the adapter, as
        // different formats may have completely different routing needs.
        // This complicates things more depending on which framework one is using.
        // Perhaps we don't care and will just enforce a standard somewhere in the microservice
        // chain.
        const serializer = adapter.getSerializerFor(rel.entity, req);
        const defaultResponse = (rel.type === 'many') ? [] : null;
        if (!record[key]) {
          return res.json(serializer.serialize(defaultResponse));
        }

        // @todo This is enforcing a native database query.
        // Once microserviced, this should use the entity service to retrieve data
        // and not the db directly.
        // @todo Relationships should support more options than just a foreign id.
        // The rel definition could (and probably should) support query parameters of any kind.
        let response;
        const relCollection = loadCollection(rel.entity);
        if (rel.type === 'many') {
          if (Array.isArray(record[key])) {
            const identifiers = [];
            record[key].forEach((value) => {
              if (value.id) {
                identifiers.push(value.id);
              }
            });
            if (identifiers.length) {
              relCollection.find({ _id: { $in: identifiers } }, (err, records) => {
                if (err) {
                  return next(err);
                }
                res.json(serializer.serialize(records));
              });
              return;
            } else {
              response = defaultResponse;
            }
          } else {
            response = defaultResponse;
          }
        } else {
          if (record[key].id) {
            findById(relCollection, record[key].id, (err, record) => {
              // If an error, make it 'soft' by removing the model from the response.
              response = (err) ? defaultResponse : record;
              res.json(serializer.serialize(response));
            });
            return;
          } else {
            response = defaultResponse;
          }
        }
        res.json(serializer.serialize(response));
      });
    });
  })
;
router.route('/:type/:id/:relField')
  .post((req, res, next) => {
    next(httpError(501, 'Modifying relationships via the `related` link is not yet available.'));
  })
  .patch((req, res, next) => {
    next(httpError(501, 'Modifying relationships via the `related` link is not yet available.'));
  })
;

module.exports = router;
