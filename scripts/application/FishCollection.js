SUBMERSIBLE.FishCollection = Backbone.Collection.extend({

	model : SUBMERSIBLE.Fish,

	initialize : function() {
		this.previousTime = performance.now();
	},
	update : function() {
		//update the timestep
		var now = performance.now();
		var timestep = now - this.previousTime;
		//normalize the timestep
		var scalar = timestep / 16;
		this.previousTime = now;
		this.forEach(function(model) {
			model.update(scalar);
		});
		this.addFish(timestep);
		/*
		_.forEach(visibles, function(model) {
			model.update(timestep, scalar, now);
		});
		
		//periodically add a fish to the scene
		if(RANDOM.getFloat() > .99) {
			//make a new fish appear
			var notVisible = this.where({
				visible : false,
			})
			if(notVisible.length > 0) {
				var chosen = RANDOM.choose(notVisible);
				chosen.set("visible", true);
			}
		}
		*/
	},
	addFish : function(step) {
		for(var fishNum = 0; fishNum < SUBMERSIBLE.Fishes.length; fishNum++) {
			var fish = SUBMERSIBLE.Fishes[fishNum];
			var prob = fish.probability * 1000;
			var onceAsecond = 1 / prob;
			if(RANDOM.getFloat() < (onceAsecond * step)) {
				//add that fish to the collection
				var f = new SUBMERSIBLE.Fish(fish.attributes, fish.options);
				this.add(f);
			}
		}
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
