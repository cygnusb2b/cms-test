module.exports = {
  type: 'story',
  attributes: ['title', 'description', 'body'],
  relationships: {
    tags: { type: 'many', entity: 'tags' },
    author: { type: 'one', entity: 'people' },
  },
};
