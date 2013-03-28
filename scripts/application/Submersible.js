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

	//var audioContext = new webkit;

	//INITIALIZATION///////////////////////////////////////////////////////////

	function initialize() {
		$container = $("#container");
		//make the model
		SUBMERSIBLE.model = new SUBMERSIBLE.Model();
		//setup the audio context
		makeAudioContext();
		//make the background sounds player
		SUBMERSIBLE.zoneSounds = new SUBMERSIBLE.ZoneSounds({
			model : SUBMERSIBLE.model,
		})
		//the metronome
		SUBMERSIBLE.metronome = new SUBMERSIBLE.Metronome({
			bpm : 96,
		});
		//make the controls
		SUBMERSIBLE.controls = new SUBMERSIBLE.Controls({
			model : SUBMERSIBLE.model,
		})
		//the loading screen
		SUBMERSIBLE.loadingScreen = new SUBMERSIBLE.LoadingScreen({
			model : SUBMERSIBLE.model,
		})
		//load the sounds
		startLoadingSounds();
		//setup the rendering context
		setupTHREE();
		setupStats();
		//bind the basic events
		bindEvents();
		//load all of the fish images
		loadFishImages();
	}

	//AUDIO CONTEXT////////////////////////////////////////////////////////////

	var audioContext;

	function makeAudioContext() {
		audioContext = new webkitAudioContext();
		SUBMERSIBLE.context = audioContext;
		SUBMERSIBLE.output = audioContext.createGainNode();
		//a special output just for fish
		SUBMERSIBLE.fishOutput = audioContext.createGainNode();
		SUBMERSIBLE.fishOutput.gain.value = .5;
		//more like a limiter than compressor
		SUBMERSIBLE.fishCompressor = audioContext.createDynamicsCompressor();
		SUBMERSIBLE.fishCompressor.threshold.value = -10;
		SUBMERSIBLE.fishCompressor.ratio.value = 20;
		//connect it up
		SUBMERSIBLE.fishOutput.connect(SUBMERSIBLE.fishCompressor);
		SUBMERSIBLE.fishCompressor.connect(audioContext.destination)
		SUBMERSIBLE.output.connect(audioContext.destination);
		//move the listener
		audioContext.listener.setPosition(0, 0, 5);
	}

	//THREE////////////////////////////////////////////////////////////////////

	var projector, renderer;

	function setupTHREE() {
		SUBMERSIBLE.camera = new THREE.PerspectiveCamera(40, 4 / 3, 1, 6000);
		SUBMERSIBLE.camera.position.set(0, 0, 0);
		SUBMERSIBLE.scene = new THREE.Scene();
		projector = new THREE.Projector();
		//the renderer
		if(Detector.canvas) {
			renderer = new THREE.CanvasRenderer();
		} else {
			alert("sorry, get a new browser");
		}
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

	function offscreenTest(model) {
		var object = model.view.sprite;
		var size = model.get('size');
		var zDist = SUBMERSIBLE.camera.position.z - object.position.z;
		var yDist = SUBMERSIBLE.camera.position.y - object.position.y;
		if(zDist < 0) {
			return true;
		}
		var vFOV = (Math.PI * SUBMERSIBLE.camera.fov) / 180;
		var visibleHeight = 2 * Math.tan(vFOV / 2) * zDist;
		var aspect = SUBMERSIBLE.camera.aspect;
		var hFOV = 2 * Math.atan(Math.tan(vFOV / 2) * aspect);
		var visibleWidth = 2 * Math.tan((hFOV / 2 )) * zDist;
		return (Math.abs(object.position.x) > visibleWidth / 2 || Math.abs(yDist) > visibleHeight / 2);
	}

	//EVENTS/////////////////////////////////////////////////////////////////////

	function bindEvents() {
		$(window).resize(sizeTHREE);
		//$container.click(mouseClicked);
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

	//LOADING//////////////////////////////////////////////////////////////////

	function incrementLoading() {
		var loadTotal = SUBMERSIBLE.Fishes.length * 2 + 5;
		SUBMERSIBLE.model.set("loadedAssets", SUBMERSIBLE.model.get("loadedAssets") + 1);
	}

	function startLoadingSounds() {
		loadLoadingWater(function() {
			loadFishSounds();
		})
	}

	function loadFishImages() {
		//var images = {};
		var loadedImages = 0;
		var numImages = SUBMERSIBLE.Fishes.length;
		// get num of sources
		for(var fishNum = 0; fishNum < numImages; fishNum++) {
			var fish = SUBMERSIBLE.Fishes[fishNum];
			var imgName = fish.attributes.image;
			fish.attributes.image = new Image();
			fish.attributes.image.src = "./images/" + imgName;
			fish.attributes.image.onload = function(fish) {
				return function() {
					fish.attributes.imageWidth = this.width;
					fish.attributes.imageHeight = this.height;
					incrementLoading();
				}
			}(fish);
		}
	}

	function loadFishSounds() {
		//load the zone sounds
		var zoneSounds = ['zone0_2.mp3', 'zone1_2.mp3', 'zone2_2.mp3', 'zone3_2.mp3'];
		for(var i = 0; i < zoneSounds.length; i++) {
			loadURL(zoneSounds[i], function(index) {
				return function(buffer) {
					SUBMERSIBLE.zoneSounds.buffers[index] = buffer;
				}
			}(i));
		}
		//load each of the fish sounds
		var fishes = SUBMERSIBLE.Fishes;
		for(var fishNum = 0; fishNum < fishes.length; fishNum++) {
			var fish = fishes[fishNum];
			if(fish.attributes.sound) {
				loadURL(fish.attributes.sound, function(fish) {
					return function(buffer) {
						fish.attributes.sound = buffer;
					}
				}(fish));
			} else {
				incrementLoading();
			}
		}
	}

	function loadURL(url, callback) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', "./audio/" + url, true);
		xhr.responseType = 'arraybuffer';
		xhr.onload = function(e) {
			SUBMERSIBLE.context.decodeAudioData(this.response, function(buffer) {
				//fish.attributes.sound = buffer;
				callback(buffer);
				incrementLoading();
			}, function(e) {
				console.log('Error decoding file', e);
			});
		}
		xhr.send();
	}

	//the gain that controls the loading sound
	var introLoadingGain;

	//loading water and submarine sounds
	function loadLoadingWater(callback) {
		introLoadingGain = SUBMERSIBLE.context.createGainNode();
		loadURL("loadingWater.mp3", function(buffer) {
			//star the sound
			var now = SUBMERSIBLE.context.currentTime;
			var source = SUBMERSIBLE.context.createBufferSource();
			source.buffer = buffer;
			source.loop = true;
			source.connect(introLoadingGain);
			source.noteOn(0);
			//fade it in
			var currentGain = introLoadingGain.gain.value;
			introLoadingGain.gain.cancelScheduledValues(now);
			introLoadingGain.gain.setValueAtTime(currentGain, now);
			introLoadingGain.gain.linearRampToValueAtTime(1, now + 3);
			introLoadingGain.connect(SUBMERSIBLE.output);
			callback();
		})
	}

	//DRAW LOOP//////////////////////////////////////////////////////////////////

	function start() {
		render();
		SUBMERSIBLE.metronome.start();
		//fade the other water sound out
		var now = SUBMERSIBLE.context.currentTime;
		var currentGain = introLoadingGain.gain.value;
		introLoadingGain.gain.cancelScheduledValues(now);
		introLoadingGain.gain.setValueAtTime(currentGain, now);
		introLoadingGain.gain.linearRampToValueAtTime(0, now + 3);
	}

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
		offscreenTest : offscreenTest,
		start : start,
	};

}();

SUBMERSIBLE.Model = Backbone.Model.extend({
	defaults : {
		"zone" : 0,
		//the space between zones
		"zoneDifference" : 4000,
		//the speed of the sub
		"speed" : 4,
		//the loading progress
		"loaded" : false,
		"loadedAssets" : 0,
		//if the user has selected start
		"started" : false,
	},
	initialize : function(attributes, options) {
		this.on("change:zone", this.moveZones);
	},
	validate : function(attributes) {
		if(attributes.zone < 0 || attributes.zone > 3) {
			return 'not a valid zone';
		}
	},
	moveZones : function(model, zone) {
		//find the zone change
		var diff = Math.abs(zone - model.previous("zone"));
		var $seawall = $("#seaWall");
		//var scrollTop = zone * seawall.height();
		var animationTime = 5000 * diff;
		var zoneDifference = this.get("zoneDifference");
		if(this.cameraTween) {
			this.cameraTween.stop();
		}
		this.cameraTween = new TWEEN.Tween({
			scrollTop : $seawall.scrollTop(),
			cameraY : SUBMERSIBLE.camera.position.y,
		}).to({
			scrollTop : zone * $seawall.height(),
			cameraY : -(zone * zoneDifference),
		}, animationTime).easing(TWEEN.Easing.Quadratic.InOut).onUpdate(function() {
			$seawall.scrollTop(this.scrollTop);
			SUBMERSIBLE.camera.position.setY(this.cameraY);
		}).start();
	},
})

/*
 * THE SOUNDS THAT EACH ZONE MAKES
 */
SUBMERSIBLE.ZoneSounds = Backbone.View.extend({
	initialize : function() {
		//the background sounds of the zones
		this.buffers = [];
		this.listenTo(this.model, "change:zone", this.changeZoneSound);
		//start all the sounds once it's loaded
		this.listenTo(this.model, "change:started", this.queueStart);
	},
	changeZoneSound : function(model, zone) {
		var now = SUBMERSIBLE.context.currentTime;
		var rampTime = 5;
		var gain = this.gains[zone];
		//fade in teh current gain
		var currentGain = gain.gain.value;
		gain.gain.cancelScheduledValues(now);
		gain.gain.setValueAtTime(currentGain, now);
		gain.gain.linearRampToValueAtTime(.5, now + rampTime);
		//fade out the previous gain
		var previousZone = this.model.previous("zone");
		var previousGain = this.gains[previousZone];
		//ramp the previous gain down, and ramp the current gain up
		if(previousZone !== zone) {
			var prevGainVal = previousGain.gain.value;
			previousGain.gain.cancelScheduledValues(now);
			previousGain.gain.setValueAtTime(prevGainVal, now);
			previousGain.gain.linearRampToValueAtTime(0, now + rampTime);
		}
	},
	queueStart : function(model, started) {
		if(started) {
			//queue the start in time
			this.listenToOnce(SUBMERSIBLE.metronome, "change:1n", this.startSounds);
		}
	},
	startSounds : function(model, quarterNode, time) {
		this.makeGains();
		var context = SUBMERSIBLE.context;
		//make a buffer player and connect all of the sounds
		for(var g = 0; g < this.buffers.length; g++) {
			var gain = this.gains[g];
			var buffer = this.buffers[g];
			//make the buffer player
			var source = context.createBufferSource();
			source.buffer = buffer;
			source.loop = true;
			source.connect(gain);
			source.noteOn(time);
		}
		//set the gain of the current zone;
		this.changeZoneSound(this.model, this.model.get("zone"));
	},
	makeGains : function() {
		this.gains = [];
		var context = SUBMERSIBLE.context;
		for(var g = 0; g < this.buffers.length; g++) {
			var gain = context.createGainNode();
			gain.connect(SUBMERSIBLE.output);
			this.gains.push(gain);
			//start hte gains out at 0
			gain.gain.value = 0;
		}
	},
});

/*
 * THE SUBMARINE CONTROLS
 */
SUBMERSIBLE.Controls = Backbone.View.extend({
	initialize : function() {
		this.listenTo(this.model, "change:started", this.startControls);
	},
	startControls : function(model, started) {
		//bind the events once it starts so it doesn't throw any errors in loading
		this.bindEvents();
	},
	bindEvents : function() {
		//listen for the arrow keys
		$(document).keydown(function(e) {
			//arrow up
			if(e.keyCode === 38) {
				SUBMERSIBLE.model.set("zone", SUBMERSIBLE.model.get("zone") - 1, {
					validate : true,
				});
				return false;
			} else if(e.keyCode === 40) {
				SUBMERSIBLE.model.set("zone", SUBMERSIBLE.model.get("zone") + 1, {
					validate : true,
				});
				return false;
			}
		});
	}
});

/*
 * THE SUBMARINE CONTROLS
 */
SUBMERSIBLE.LoadingScreen = Backbone.View.extend({
	events : {
		"click #startButton" : 'startClicked',
	},
	initialize : function() {
		this.listenTo(this.model, "change:loadedAssets", this.updateProgress);
		this.setElement($("#loadingScreen"));
		this.$loadingProgress = this.$el.find("#loadedArea");
	},
	updateProgress : function(model, loadedAssets) {
		var loadTotal = SUBMERSIBLE.Fishes.length * 2 + 5;
		//move the bar
		var percentage = Math.round((loadedAssets / loadTotal) * 100);
		percentage += "%";
		this.$loadingProgress.width(percentage);
		if(loadedAssets === loadTotal) {
			this.allLoaded();
		}
	},
	allLoaded : function() {
		//when everything is loaded
		this.model.set("loaded", true);
		//when everything is loaded, make the collection
		SUBMERSIBLE.fishCollection = new SUBMERSIBLE.FishCollection();
		//turn the loading bar into a button
		this.$loadingProgress.html("<div id='startButton'>START</div>");
	},
	startClicked : _.once(function() {
		//fade the loading screen out
		this.$el.fadeTo(2000, 0, function() {
			$(this).css({
				"z-index" : -1000,
			})
		})
		//and start the drawing
		SUBMERSIBLE.start();
		//start the model
		this.model.set("started", true);
	})
});

//development version
SUBMERSIBLE.dev = true;
