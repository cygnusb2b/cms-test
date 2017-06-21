# CMS REST API (server)

This README outlines the details of the backend CMS REST API using NodeJS.

**Please note:** it is not expected that you modify any code in the server folder - though you're more than welcome to.

In reality, you shouldn't need to know the specific details of the backend API, as the Ember app (`../admin`) will automatically communicate with this backened. This is merely for informational purposes and can be ignored if desired.

## Prerequisites

You will need the following things properly installed on your computer.

* [Node.js LTS](https://nodejs.org/) (with NPM)

## Installation

* `cd server`
* `npm install`

## Running / Development

* `npm run start`
* Visit the API at [http://localhost:8888/api](http://localhost:8888/api).

## REST API Details

The API application serves as a "simulated" backened that provides database persistence using [NeDB](https://github.com/louischatriot/nedb) and [RESTful](https://en.wikipedia.org/wiki/Representational_state_transfer) endpoints using [Express](https://expressjs.com/). It's sole purpose is to provide a simple data layer for the EmberJS frontend. The API itself follows the [JSON API](http://jsonapi.org/) spec.

### Models / Endpoints
Three model types are supported by the backened: `person (pl. people)`, `story (pl. stories)` and `tag (pl. tags)`. Model [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) operations are handled by interacting with the appropriate endpoints.
* Access all models for a type `GET /api/{pluralized-model-name}`
* Access a single model by type and id `GET /api/{pluralized-model-name}/{id}`
* Create a single model for a type `POST /api/{pluralized-model-name}`
* Update a single model by type and id `PATCH /api/{pluralized-model-name}/{id}`
* Delete a single model by type and id `DELETE /api/{pluralized-model-name}/{id}`

For specific details on response formats and POST/PATCH request bodies, see the [JSON API spec](http://jsonapi.org/).

### Schema
#### Person (People)
```js
{
  attributes: ['firstName', 'lastName'],
  relationships: { }
}
```
#### Story (Stories)
```js
{
  attributes: ['title', 'description', 'body'],
  relationships: {
    tags: { type: 'many', entity: 'tags' },
    author: { type: 'one', entity: 'people' }
  }
}
```
#### Tag (Tags)
```js
{
  attributes: ['name', 'description'],
  relationships: { }
}
```
