define('binding/binding', [
	'class', 'binding/notify-property-changed', 'binding/converter'
], function(Class, NotifyPropertyChanged, Converter) {
	/**
	 * @class Binding
	 * @namespace Binding
	 */
	var Binding = Class.extend({
		/**
		 * @constructor
		 * @param {Object} [source]
		 * @param {String} [path]
		 * @param {Object} [target]
		 * @param {String} [property]
		 * @param {Binding.Converter|Function} [converter]
		 */
		constructor: function(source, path, target, property, converter) {
			// To avoid updating target multiple times
			this.delayedUpdate = true;
			this.nested = false;
			this.nestedBinding = null;
			if (converter) {
				this.setConverter(converter);
			}
			this.setSource(source);
			this.setPath(path);
			this.setTarget(target);
			this.setProperty(property);
			this.delayedUpdate = false;
			this.updateTarget();
		},

		/**
		 * @param {Object} source
		 */
		setSource: function(source) {
			if (NotifyPropertyChanged.isImplementedBy(this.source)) {
				this.source.propertyChanged.remove(this.onSourcePropertyChanged, this);
			}
			this.source = source;
			if (NotifyPropertyChanged.isImplementedBy(this.source)) {
				this.source.propertyChanged.add(this.onSourcePropertyChanged, this);
			}
			this.updateTarget();
		},

		/**
		 * @returns {Object}
		 */
		getSource: function() {
			return this.source;
		},

		/**
		 * @param {String} path
		 */
		setPath: function(path) {
			this.path = path;
			if (typeof path === 'string' && path.indexOf('.') !== -1) {
				var match = path.match(/^([^\.]*)\.(.*)$/);
				this.sourceProperty = match[1];
				this.nested = true;
				this.nestedBinding = new Binding(null, match[2], this.target,
					this.property, this.converter);
			} else {
				this.nested = false;
				this.sourceProperty = path;
			}
			this.updateTarget();
		},

		/**
		 * @returns {String}
		 */
		getPath: function() {
			return this.path;
		},

		/**
		 * @param {Object} target
		 */
		setTarget: function(target) {
			this.target = target;
			if (this.nested) {
				this.nestedBinding.setTarget(this.target);
			}
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
			if (this.nested) {
				this.nestedBinding.setProperty(this.property);
			}
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
			if (this.nested) {
				this.nestedBinding.setConverter(this.converter);
			} else {
				this.updateTarget();
			}
		},

		/**
		 * @returns {Binding.Converter|Function}
		 */
		getConverter: function() {
			return this.converter;
		},

		/**
		 * @private
		 * @param {Binding.NotifyPropertyChanged} source
		 * @param {String} name
		 */
		onSourcePropertyChanged: function(source, name) {
			if (name === this.sourceProperty || this.sourceProperty === undefined ||
					this.sourceProperty === null || this.sourceProperty === '') {
				this.updateTarget();
			}
		},

		/**
		 * @private
		 * @returns {*}
		 */
		getSourcePropertyValue: function() {
			if (this.source === undefined || this.source === null) {
				return this.source;
			}
			if (this.sourceProperty === undefined || this.sourceProperty === null || this.sourceProperty === '') {
				return this.source;
			}
			var property = String(this.sourceProperty);
			var prefixes = ['get', 'is', 'has'];
			var suffix = property.charAt(0).toUpperCase() + property.substring(1);
			for (var i = 0; i < prefixes.length; i++) {
				var method = prefixes[i] + suffix;
				if (typeof this.source[method] === 'function') {
					return this.source[method]();
				}
			}
			return this.source[this.sourceProperty];
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
			if (!this.nested && (this.target === undefined || this.target === null ||
					this.property === undefined || this.property === null)) {
				return;
			}
			var value = this.getSourcePropertyValue();
			if (this.nested) {
				this.nestedBinding.setSource(value);
			} else {
				var converter = this.converter;
				if (Converter.isImplementedBy(converter)) {
					value = converter.convert(value);
				} else if (this.converter) {
					value = converter(value);
				}
				var method = 'set' + this.property.charAt(0).toUpperCase() + this.property.substring(1);
				if (typeof this.target[method] === 'function') {
					this.target[method](value);
				} else {
					this.target[this.property] = value;
				}
			}
		}
	});

	return Binding;
});