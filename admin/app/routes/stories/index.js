import Ember from 'ember';

const { inject: { service } } = Ember;

export default Ember.Route.extend({

  loadingOverlay: service(),

  model() {
    this.get('loadingOverlay').show();
    return this.store.query('story', {}).finally(() => this.get('loadingOverlay').hide());
  },

  actions: {
    /**
     * Populates a test article.
     */
    populate() {
      this.get('loadingOverlay').show();
      this.store.createRecord('story', {
        title: 'Test Article 1',
        description: 'This is a short, interesting description about this article!',
        body: 'The article body goes here... what should do if we wanted HTML in this field?',
      }).save()
        .then(() => this.refresh())
        .finally(() => this.get('loadingOverlay').hide());
      ;
    },
  },
});
