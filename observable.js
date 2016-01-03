define('binding/observable', [
	'class', 'binding/observable-interface', 'event'
], function(Class, ObservableInterface, Event) {
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

	return Observable;
});