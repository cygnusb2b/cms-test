import Ember from 'ember';

const { Service, $ } = Ember;

export default Service.extend({
  selector: '.loading-overlay',

  show() {
    this.getElement().show();
  },

  hide() {
    this.getElement().hide();
  },

  toggle() {
    this.getElement().toggle();
  },

  getElement() {
    return $(this.get('selector'));
  },
});
