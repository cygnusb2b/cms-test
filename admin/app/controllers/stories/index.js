import Ember from 'ember';

export default Ember.Controller.extend({

  store: Ember.inject.service(),

  actions: {
    populate() {
      const stories = [
        {
          title: 'Test Article 1',
          description: 'This is a short, interesting description about this article!',
          body: 'The article body goes here... what should do if we wanted HTML in this field?',
        }
      ];
      stories.forEach(story => {
        const model = this.get('store').createRecord('story', story);
        model.save();
      });
    },
  },
});
