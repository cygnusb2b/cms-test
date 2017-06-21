import Ember from 'ember';

const { inject: { service } } = Ember;

export default Ember.Route.extend({

  loadingOverlay: service(),

  model() {
    this.get('loadingOverlay').show();
    return this.store.query('tag', {}).finally(() => this.get('loadingOverlay').hide());
  },
});
