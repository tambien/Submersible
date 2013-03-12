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
		//setup the rendering context
		setupTHREE();
		setupStats();
		//bind the basic events
		bindEvents();
		//make a fish
		SUBMERSIBLE.fishCollection = new SUBMERSIBLE.FishCollection();
		var fish = new SUBMERSIBLE.Fish();
		SUBMERSIBLE.fishCollection.add(fish);
		//start the drawing
		render();
	}

	//THREE////////////////////////////////////////////////////////////////////

	var projector, renderer;

	function setupTHREE() {
		SUBMERSIBLE.camera = new THREE.PerspectiveCamera(30, 4 / 3, 1, 10000);
		SUBMERSIBLE.camera.position.set(0, 0, 1000);
		SUBMERSIBLE.scene = new THREE.Scene();
		projector = new THREE.Projector();
		//the renderer
		renderer = new THREE.WebGLRenderer();
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
	
	function bindEvents(){
		$(window).resize(sizeTHREE);
		$container.click(mouseClicked);
	}
	
	function mouseClicked(event){
		event.preventDefault();
		var vector = new THREE.Vector3((event.offsetX / SUBMERSIBLE.width ) * 2 - 1, -(event.offsetY /SUBMERSIBLE.height ) * 2 + 1, 0.5);
		projector.unprojectVector(vector, SUBMERSIBLE.camera);

		var raycaster = new THREE.Raycaster(SUBMERSIBLE.camera.position, vector.sub(SUBMERSIBLE.camera.position).normalize());
		
		var intersects = raycaster.intersectObjects(SUBMERSIBLE.scene.children);
		if(intersects.length > 0) {
			var intersected = intersects[0].object;
			if (intersected.onclick){
				intersected.onclick();
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
	}

	//API//////////////////////////////////////////////////////////////////////

	return {
		initialize : initialize,
	};

}();

//development version
SUBMERSIBLE.dev = true;
