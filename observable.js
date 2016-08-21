var Class = require('class');
var ObservableInterface = require('binding/observable-interface');
var Event = require('event');

/**
 * @class Observable
 * @implements {Binding.ObservableInterface}
 * @namespace Binding
 */
var Observable = Class.extend({
	constructor: function(object) {
		this.changed = new Event();
		if (object) {
			for (var property in object) {
				this[property] = object[property];
			}
		}
	},

	set: function(property, value) {
		if (this[property] !== value) {
			this[property] = value;
			this.notifyChanged(property);
		}
	},

	notifyChanged: function(property) {
		this.changed.trigger(this, property);
	}
});

ObservableInterface.addTo(Observable);

module.exports = Observable;