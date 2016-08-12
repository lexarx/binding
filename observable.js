var Class = require('class');
var ObservableInterface = require('binding/observable-interface');
var Event = require('event');

/**
 * @class Observable
 * @implements {Binding.ObservableInterface}
 * @namespace Binding
 */
var Observable = Class.extend({
	constructor: function() {
		this.changed = new Event();
	},

	notifyChanged: function(property) {
		this.changed.trigger(this, property);
	}
});

ObservableInterface.addTo(Observable);

module.exports = Observable;