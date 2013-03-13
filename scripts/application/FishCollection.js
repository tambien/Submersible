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
		timestep /= 16;
		this.previousTime = now;
		//update each of the fish with a sinusoidal timestep
		var pi2 = Math.PI * 2;
		var self = this;
		this.forEach(function(model) {
			model.update(timestep, now);
		});
		//periodically add a fish to the scene
		if (RANDOM.getFloat() > .9){
			//make a new fish appear
		}
	},
	periodicSine : function(period, theta) {
		return Math.sin(theta);
	},
});

//PERFORMANCE NOW POLYFIL from http://gent.ilcore.com/2012/06/better-timer-for-javascript.html
window.performance = window.performance || {};
performance.now = (function() {
	return performance.now || performance.mozNow || performance.msNow || performance.oNow || performance.webkitNow ||
	function() {
		return new Date().getTime();
	};

})();
