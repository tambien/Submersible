SUBMERSIBLE.FishCollection = Backbone.Collection.extend({

	model : SUBMERSIBLE.Fish,

	initialize : function() {
		this.previousTime = performance.now();
		//listen for the start to fill the ocean with fish
		var throttledZoneFill = _.throttle(_.bind(this.fillZone, this), 5000);
		//var throttledZoneFill = _.throttle(_.bind(this.fillZone, this), 5000);
		this.listenTo(SUBMERSIBLE.model, "change:started", throttledZoneFill);
		this.listenTo(SUBMERSIBLE.model, "change:zone", throttledZoneFill);
		//set a timeout to test offscreenness less frequently
		this.slowUpdateInterval = setInterval(function(self) {
			self.slowUpdate();
		}, 500, this);
		//create all of the fish and add them to the collection
		this.createFish();
	},
	createFish : function() {
		for(var i = 0; i < SUBMERSIBLE.Fishes.length; i++) {
			var fishType = SUBMERSIBLE.Fishes[i];
			for(var j = 0; j < fishType.count; j++) {
				var f = new SUBMERSIBLE.Fish(fishType.attributes, fishType.options);
				this.add(f);
			}
		}
	},
	update : function() {
		//update the timestep
		var now = performance.now();
		var timestep = now - this.previousTime;
		//normalize the timestep
		var scalar = timestep / 16;
		this.previousTime = now;
		var visible = this.where({
			"visible" : true,
		})
		_.forEach(visible, function(model) {
			model.update(scalar, timestep);
			//model.offscreenTest();
			//update the sound position
			//model.sound.update();
		});
		//this.addFish(timestep);
	},
	/*
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
	 },*/
	addFish : function() {
		//get the fish that are in this zone
		var currentZone = SUBMERSIBLE.model.get("zone");
		var fishInZone = this.filter(function(model) {
			var zoneArray = model.get("palegicZone");
			return (zoneArray[0] <= currentZone && zoneArray[1] >= currentZone);
		})
		var fish = RANDOM.choose(fishInZone);
		fish.set("visible", true);
	},
	addBubble : function() {
		
	},
	//initially fill the ocean with fish so that it's not empty when you start
	fillZone : function() {
		this.addZoneBubbles();
		/*
		 for(var i = 0; i < 10; i++) {
		 var fish = this.addFish(1000);
		 if (fish){
		 fish.putInCenter();
		 }
		 }*/
	},
	//add the zone bubbles to the screen when changing zones
	addZoneBubbles : function() {
		var currentZone = SUBMERSIBLE.model.get("zone");
		var bubbles = this.filter(function(model) {
			var zoneArray = model.get("palegicZone");
			return (zoneArray[0] <= currentZone && zoneArray[1] >= currentZone && model.get("backgroundBubble") && !model.get("visible"));
		})
		//put a quarter of the bubbles on the screen
		for(var i = 0; i < bubbles.length / 4; i++) {
			var model = bubbles[i];
			model.set("visible", true);
			model.putInCenter();
		}
	},
	slowUpdate : function() {
		this.addFish();
		var visible = this.where({
			"visible" : true,
		})
		_.forEach(visible, function(model) {
			model.offscreenTest();
			//update the sound position
			model.sound.update();
			model.view.positionFish(model);
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
