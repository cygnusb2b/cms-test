import Ember from 'ember';

const { Route, inject: { service } } = Ember;

export default Route.extend({
  /**
   * The loading overlay display service.
   */
  loadingOverlay: service(),

  /**
   * Actions, which can be called in handlebars templates via the `route-action` helper.
   * @see {@link https://github.com/DockYard/ember-route-action-helper}
   */
  actions: {
    /**
     * Transitions to the provided route name.
     *
     * @param {string} name The route name to transition to, e.g. `stories.index`.
     */
    linkTo(name) {
      this.transitionTo(name);
    },

    /**
     * Generically saves a model and, optionally, transitions to the provided route name.
     *
     * @param {DS.Model} model The model to save.
     * @param {string} [transitionToRoute] The (optional) route to transition to once complete.
     */
    saveModel(model, transitionToRoute) {
      const overlay = this.get('loadingOverlay');
      overlay.show();

      model.save()
        .then(() => {
          if (transitionToRoute) {
            this.send('linkTo', transitionToRoute);
          }
        })
        // @todo Perhaps user-friendly error handling should be added? ;)
        .catch(err => console.error('saveModel errored!', err))
        .finally(() => overlay.hide())
      ;
    },

    /**
     * Generically deletes a model and, optionally, transitions to the provided route name.
     *
     * @param {DS.Model} model The model to delete.
     * @param {string} [transitionToRoute] The (optional) route to transition to once complete.
     */
    deleteModel(model, transitionToRoute) {
      // @todo Perhaps some kind of confirmation should be added before allowing the delete?
      model.deleteRecord();
      this.send('saveModel', model, transitionToRoute);
    },
  },
});
