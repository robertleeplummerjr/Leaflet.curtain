(function(L) {
	/**
	 * @param {L.Map} map
	 * @constructor
	 */
	function Curtain(map) {
		this.map = map;
		this.items = [];
	}

	Curtain.prototype = {
		/**
		 * @param layer
		 * @param feature
		 */
		add: function(layer, feature) {
			this.items.push({
				feature: feature,
				layer: layer,
				off: false
			});
		},

		/**
		 * Turns a layer on, so that it will be seen when it comes into view port
		 * @param {Object} item
		 * @param {Boolean} [skipAddingLayer]
		 */
		turnOn: function(item, skipAddingLayer) {
			item.off = false;

			if (skipAddingLayer !== true) {
				this.map.addLayer(item.layer);
			}
		},

		/**
		 * Turns a layer off, so that it will not be be seen even when it comes into view port
		 * @param item
		 */
		turnOff: function(item) {
			item.off = true;

			var
				layer = item.layer,
				element = layer._icon;

			if (
				element !== undefined
				&& element !== null
				&& element.parentNode !== null
			) {
				this.map.removeLayer(layer);
			}
		},

		/**
		 * Iterates through all items
		 * @param {Function} fn has three arguments, layer, feature, & item
		 */
		all: function (fn) {
			this.updateBounds();

			var items = this.items,
				max = items.length,
				i = 0,
				item,
				icon;

			for(;i < max; i++) {
				item = items[i];
				icon = item.layer._icon;

				fn.call(this, item.layer, item.feature, item);
			}
		},

		/**
		 * Updates the cached bounds of the map
		 */
		updateBounds: function() {
			var bounds = this.bounds = this.map.getBounds();
			this.ne = bounds._northEast;
			this.sw = bounds._southWest;
		},

		/**
		 * Detects if a feature is in the view port
		 * @param feature
		 * @returns {boolean}
		 */
		isInViewPort: function(feature) {
			var coordinates = feature.geometry.coordinates,
				lat = coordinates[1],
				lon = coordinates[0],
				sw = this.sw,
				ne = this.ne;

			return (
			lat > sw.lat
			&& lat < ne.lat
			&& lon > sw.lng
			&& lon < ne.lng
			);
		},

		/**
		 * Iterates through all visible items
		 * @param fn has three arguments, layer, feature, & item
		 */
		eachVisible: function(fn) {
			this.updateBounds();

			var items = this.items,
				max = items.length,
				i = 0,
				item,
				icon;

			for(;i < max; i++) {
				item = items[i];
				if (item.off) continue;

				icon = item.layer._icon;
				if (
					icon !== undefined
					&& icon !== null
				) {
					fn.call(this, item.layer, item.feature);
				}
			}
		},

		/**
		 * Refreshes the visible area, and removes layers inside of the "curtain" (area outside the view port)
		 */
		refresh: function() {
			this.updateBounds();

			var items = this.items,
				max = items.length,
				map = this.map,
				ne = this.ne,
				sw = this.sw,
				coordinates,
				element,
				i = 0,
				item,
				lat,
				lon;

			for (;i < max;i++) {
				item = items[i];
				if (item.off) continue;

				element = item.layer._icon;
				coordinates = item.feature.geometry.coordinates;
				lat = coordinates[1];
				lon = coordinates[0];

				if (
					lat < sw.lat
					|| lat > ne.lat
					|| lon < sw.lng
					|| lon > ne.lng
				) {
					if (
						element !== undefined
						&& element !== null
						&& element.parentNode !== null
					) {
						map.removeLayer(item.layer);
					}
				} else if (
					element === undefined
					|| element === null
					|| element.parentNode === null
				) {
					map.addLayer(item.layer);
				}
			}
		}
	};

	L.Curtain = Curtain;
})(L);