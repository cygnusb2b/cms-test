import Ember from 'ember';

const { Component, computed } = Ember;

export default Component.extend({
  tagName: 'nav',
  classNames: ['navbar'],
  classNameBindings: ['light:navbar-light', 'inverse:navbar-inverse', 'stickyTop:sticky-top', '_placementClassName', '_toggleableClassName'],

  light: false,
  inverse: false,
  stickyTop: false,
  fixed: null, // one of top or bottom.
  toggleable: null, // one of true (for default xs behavior), sm, md, lg, xl.

  _placementClassName: computed('fixed', function() {
    switch (this.get('fixed')) {
      case 'top':
        return 'fixed-top';
      case 'bottom':
        return 'fixed-bottom';
      default:
        return;
    }
  }),

  _toggleableClassName: computed('toggleable', function() {
    const baseName = 'navbar-toggleable';
    const sizes = ['sm', 'md', 'lg', 'xl'];
    const toggleable = this.get('toggleable');
    if (!toggleable) {
      return;
    }
    if (true === toggleable) {
      return baseName;
    }
    const index = sizes.indexOf(toggleable);
    if (-1 === index) {
      return;
    }
    return `${baseName}-${sizes[index]}`;
  }),

});
