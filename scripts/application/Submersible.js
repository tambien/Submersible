//jumping off point
$(function() {
	SUBMERSIBLE.initialize();
});
/*
 * SUBMERSIBLE
 *
 * the main application
 */
var SUBMERSIBLE = function() {

	var $container;

	//INITIALIZATION///////////////////////////////////////////////////////////

	function initialize() {
		$container = $("#container");
		//make the model
		SUBMERSIBLE.model = new SUBMERSIBLE.Model();
		//setup the rendering context
		setupTHREE();
		setupStats();
		//bind the basic events
		bindEvents();
		//make a fish
		SUBMERSIBLE.fishCollection = new SUBMERSIBLE.FishCollection();
		//fill the collection
		fillCollection();
		//start the drawing
		render();
	}

	//THREE////////////////////////////////////////////////////////////////////

	var projector, renderer;

	function setupTHREE() {
		SUBMERSIBLE.camera = new THREE.PerspectiveCamera(25, 4 / 3, 1, 10000);
		SUBMERSIBLE.camera.position.set(0, 0, 1000);
		SUBMERSIBLE.scene = new THREE.Scene();
		projector = new THREE.Projector();
		//the renderer
		renderer = new THREE.CanvasRenderer();
		//renderer = new THREE.WebGLRenderer();
		$container.append(renderer.domElement);
		//initialize the size
		sizeTHREE();
	}

	function sizeTHREE() {
		SUBMERSIBLE.width = $container.width();
		SUBMERSIBLE.height = $container.height();
		SUBMERSIBLE.camera.aspect = SUBMERSIBLE.width / SUBMERSIBLE.height;
		SUBMERSIBLE.camera.updateProjectionMatrix();
		renderer.setSize(SUBMERSIBLE.width, SUBMERSIBLE.height);
	}

	var stats;

	function setupStats() {
		//add the stats for the development version
		if(SUBMERSIBLE.dev) {
			stats = new Stats();
			stats.domElement.style.position = 'absolute';
			stats.domElement.style.top = '0px';
			$container.append(stats.domElement);
		}
	}

	//EVENTS/////////////////////////////////////////////////////////////////////

	function bindEvents() {
		$(window).resize(sizeTHREE);
		$container.click(mouseClicked);
		//listen for the arrow keys
		$(document).keydown(function(e) {
			//arrow up
			if(e.keyCode === 38) {
				SUBMERSIBLE.model.set("zone", SUBMERSIBLE.model.get("zone") - 1);
				return false;
			} else if(e.keyCode === 40) {
				SUBMERSIBLE.model.set("zone", SUBMERSIBLE.model.get("zone") + 1);
				return false;
			}
		});
	}

	function mouseClicked(event) {
		event.preventDefault();
		var vector = new THREE.Vector3((event.offsetX / SUBMERSIBLE.width ) * 2 - 1, -(event.offsetY / SUBMERSIBLE.height ) * 2 + 1, 0.5);
		projector.unprojectVector(vector, SUBMERSIBLE.camera);

		var raycaster = new THREE.Raycaster(SUBMERSIBLE.camera.position, vector.sub(SUBMERSIBLE.camera.position).normalize());

		var intersects = raycaster.intersectObjects(SUBMERSIBLE.scene.children);
		if(intersects.length > 0) {
			var intersected = intersects[0].object;
			if(intersected.onclick) {
				intersected.onclick();
			}
		}
	}

	//FISH COLLECTION////////////////////////////////////////////////////////////

	function fillCollection() {
		for(var fishNum = 0; fishNum < SUBMERSIBLE.Fishes.length; fishNum++) {
			var fish = SUBMERSIBLE.Fishes[fishNum];
			for(var i = 0; i < fish.count; i++) {
				var f = new SUBMERSIBLE.Fish(fish.attributes, fish.options);
				SUBMERSIBLE.fishCollection.add(f);
			}
		}
	}

	//DRAW LOOP//////////////////////////////////////////////////////////////////

	function render() {
		requestAnimationFrame(render);
		if(SUBMERSIBLE.dev) {
			stats.update();
		}
		renderer.render(SUBMERSIBLE.scene, SUBMERSIBLE.camera);
		SUBMERSIBLE.fishCollection.update();
		TWEEN.update();
	}

	//API//////////////////////////////////////////////////////////////////////

	return {
		initialize : initialize,
	};

}();

SUBMERSIBLE.Model = Backbone.Model.extend({
	defaults : {
		"zone" : 0,
		"speed" : 10,
	},
	initialize : function(attributes, options) {
		this.on("change:zone", this.moveZones);
	},
	validate : function(attributes) {
		if(attributes.zone < 0 || attributes.zone > 2) {
			return false;
		}
	},
	moveZones : function(model, zone) {
		//find the zone change
		var diff = Math.abs(zone - model.previous("zone"));
		var $seawall = $("#seaWall");
		//var scrollTop = zone * seawall.height();
		var animationTime = 4000 * diff;
		/*
		$("#seaWall").stop().animate({
			scrollTop : scrollTop,
		}, animationTime * diff, 'easeInOutQuad');
		*/
		//tween the camera as well
		//
		if(this.cameraTween) {
			this.cameraTween.stop();
		}
		this.cameraTween = new TWEEN.Tween({
			scrollTop : $seawall.scrollTop(),
			cameraY : SUBMERSIBLE.camera.position.y,
		}).to({
			scrollTop : zone * $seawall.height(),
			cameraY : -(zone * 3000),
		}, animationTime).easing(TWEEN.Easing.Quadratic.InOut).onUpdate(function() {
			$seawall.scrollTop(this.scrollTop);
			SUBMERSIBLE.camera.position.setY(this.cameraY);
		}).start();
	}
})

//development version
SUBMERSIBLE.dev = true;
