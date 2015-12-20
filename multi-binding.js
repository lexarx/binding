define('binding/multi-binding', [
	'class', 'binding/converter'
], function(Class, Converter) {
	/**
	 * @class MultiBinding
	 * @namespace Binding
	 */
	return Class.extend({
		/**
		 * @constructor
		 * @param {Array<Binding.Binding>} [bindings]
		 * @param {Object} [target]
		 * @param {String} [property]
		 * @param {Binding.Converter|Function} [converter]
		 */
		constructor: function(bindings, target, property, converter) {
			// To avoid updating target multiple times
			this.delayedUpdate = true;
			if (converter) {
				this.setConverter(converter);
			}
			this.setBindings(bindings);
			this.setTarget(target);
			this.setProperty(property);
			this.delayedUpdate = false;
			this.updateTarget();
		},
		
		/**
		 * Creates an array of certain size filled with null and returns it
		 * @private
		 * @param {Number} size
		 * @returns {Array}
		 */
		createArray: function(size) {
			var a = [];
			for (var i = 0; i < size; i++) {
				a.push(null);
			}
			return a;
		},

		/**
		 * @param {Array<Binding.Binding>} bindings
		 */
		setBindings: function(bindings) {
			if (this.bindings !== undefined && this.bindings !== null) {
				for (var i = 0; i < this.bindings.length; i++) {
					var binding = this.bindings[i];
					binding.setTarget(null);
					binding.setProperty(null);
				}
			}
			this.bindings = bindings;
			var hasBindings = this.bindings !== undefined && this.bindings !== null;
			this.values = this.createArray(hasBindings ? this.bindings.length : 0);
			this.delayedUpdate = true;
			if (hasBindings) {
				for (var i = 0; i < this.bindings.length; i++) {
					var binding = this.bindings[i];
					var bindingObject = {
						setProperty: this.onBindingSetProperty.bind(this, i)
					};
					binding.setTarget(bindingObject);
					binding.setProperty('property');
				}
			}
			this.delayedUpdate = false;
			this.updateTarget();
		},

		/**
		 * @returns {Array<Binding.Binding>}
		 */
		getBindings: function() {
			return this.bindings;
		},

		/**
		 * @param {Object} target
		 */
		setTarget: function(target) {
			this.target = target;
			this.updateTarget();
		},

		/**
		 * @returns {Object}
		 */
		getTarget: function() {
			return this.target;
		},

		/**
		 * @param {String} property
		 */
		setProperty: function(property) {
			this.property = property;
			this.updateTarget();
		},

		/**
		 * @returns {String}
		 */
		getProperty: function() {
			return this.property;
		},

		/**
		 * @param {Binding.Converter|Function} converter
		 */
		setConverter: function(converter) {
			this.converter = converter;
			this.updateTarget();
		},

		/**
		 * @returns {Binding.Converter|Function}
		 */
		getConverter: function() {
			return this.converter;
		},

		/**
		 * @private
		 * @param {Number} index
		 * @param {Mixed} value
		 */
		onBindingSetProperty: function(index, value) {
			this.values[index] = value;
			this.updateTarget();
		},

		/**
		 * @private
		 */
		updateTarget: function() {
			if (this.delayedUpdate) {
				return;
			}
			this.setTargetPropertyValue();
		},

		/**
		 * @private
		 */
		setTargetPropertyValue: function() {
			if (!(this.target && this.property)) {
				return;
			}
			var value = this.values;
			var converter = this.converter;
			if (Converter.isImplementedBy(converter)) {
				value = converter.convert(value);
			} else if (this.converter) {
				value = converter(value);
			}
			var method = 'set' + this.property[0].toUpperCase() + this.property.substring(1);
			if (typeof this.target[method] === 'function') {
				this.target[method](value);
			} else {
				this.target[this.property] = value;
			}
		}
	});
});