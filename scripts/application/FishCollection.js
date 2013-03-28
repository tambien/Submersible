SUBMERSIBLE.FishCollection = Backbone.Collection.extend({

	model : SUBMERSIBLE.Fish,

	initialize : function() {
		this.previousTime = performance.now();
		//listen for the start to fill the ocean with fish
		var throttledZoneFill = _.throttle(_.bind(this.fillZone, this), 5000);
		this.listenTo(SUBMERSIBLE.model, "change:started", throttledZoneFill);
		this.listenTo(SUBMERSIBLE.model, "change:zone", throttledZoneFill);
		//set a timeout to test offscreenness less frequently
		this.offscreenInterval = setInterval(function(self) {
			self.offscreenTest();
		}, 500, this);
	},
	update : function() {
		//update the timestep
		var now = performance.now();
		var timestep = now - this.previousTime;
		//normalize the timestep
		var scalar = timestep / 16;
		this.previousTime = now;
		this.forEach(function(model) {
			model.update(scalar, timestep);
		});
		this.addFish(timestep);
	},
	addFish : function(step) {
		for(var fishNum = 0; fishNum < SUBMERSIBLE.Fishes.length; fishNum++) {
			var fish = SUBMERSIBLE.Fishes[fishNum];
			var zoneMin = fish.attributes.palegicZone[0];
			var zoneMax = fish.attributes.palegicZone[1];
			var currentZone = SUBMERSIBLE.model.get("zone");
			if(zoneMin <= currentZone && zoneMax >= currentZone) {
				var prob = fish.probability * 1000;
				var onceAsecond = 1 / prob;
				if(RANDOM.getFloat() < (onceAsecond * step)) {
					//add that fish to the collection
					var f = new SUBMERSIBLE.Fish(fish.attributes, fish.options);
					this.add(f);
					//return f;
				}
			}
		}
	},
	//initially fill the ocean with fish so that it's not empty when you start
	fillZone : function() {
		for(var i = 0; i < 10; i++) {
			var fish = this.addFish(1000);
			if (fish){
				fish.putInCenter();
			}
		}
	},
	offscreenTest : function() {
		this.forEach(function(model) {
			model.offscreenTest();
		});
	}
});

//PERFORMANCE NOW POLYFIL from http://gent.ilcore.com/2012/06/better-timer-for-javascript.html
window.performance = window.performance || {};
performance.now = (function() {
	return performance.now || performance.mozNow || performance.msNow || performance.oNow || performance.webkitNow ||
	function() {
		return new Date().getTime();
	};

})();
