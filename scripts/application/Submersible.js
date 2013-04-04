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
		/*
		SUBMERSIBLE.metronome = new SUBMERSIBLE.Metronome({
		bpm : 96,
		});
		*/
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
		SUBMERSIBLE.fishOutput.gain.value = 1;
		//the compressor
		SUBMERSIBLE.fishCompressor = audioContext.createDynamicsCompressor();
		SUBMERSIBLE.fishCompressor.threshold.value = -30;
		SUBMERSIBLE.fishCompressor.ratio.value = 8;
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
		var size = model.get('size') / 2;
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
		return (Math.abs(object.position.x) > (visibleWidth / 2  + size)|| Math.abs(yDist) > (visibleHeight / 2 + size));
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
		var zoneSounds = ['bass0_2.mp3', 'bass1_2.mp3', 'bass2_2.mp3', 'bass3_2.mp3'];
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
		loadURL("splash.mp3", function(buffer) {
			//star the sound
			var now = SUBMERSIBLE.context.currentTime;
			var source = SUBMERSIBLE.context.createBufferSource();
			source.buffer = buffer;
			source.loop = true;
			source.loopStart = 6.2;
			source.loopEnd = buffer.duration;
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
		//fade the other water sound out
		var now = SUBMERSIBLE.context.currentTime;
		var currentGain = introLoadingGain.gain.value;
		introLoadingGain.gain.cancelScheduledValues(now);
		introLoadingGain.gain.setValueAtTime(currentGain, now);
		introLoadingGain.gain.linearRampToValueAtTime(0, now + 3);
	}

	function render() {
		requestAnimationFrame(render);
		//setTimeout(render, 32);
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
		this.makeSeaWall();
		var percent = (this.get("zone") / 3) * 100;
		this.moveSeaWall(percent);
	},
	validate : function(attributes) {
		if(attributes.zone < 0 || attributes.zone > 3) {
			return 'not a valid zone';
		}
	},
	moveZones : function(model, zone) {
		//find the zone change
		var diff = Math.abs(zone - model.previous("zone"));
		//var scrollTop = zone * seawall.height();
		var animationTime = 5000 * diff;
		var zoneDifference = this.get("zoneDifference");
		if(this.cameraTween) {
			this.cameraTween.stop();
		}
		var self = this;
		var percentage = (this.get("zone") / 4) * 100;
		this.cameraTween = new TWEEN.Tween({
			percentage : self.percentage,
			cameraY : SUBMERSIBLE.camera.position.y,
		}).to({
			percentage : percentage,
			cameraY : -(zone * zoneDifference),
		}, animationTime).easing(TWEEN.Easing.Quadratic.InOut).onUpdate(function() {
			//$seawall.scrollTop(this.scrollTop);
			self.moveSeaWall(this.percentage);
			SUBMERSIBLE.camera.position.setY(this.cameraY);
		}).start();
	},
	moveSeaWall : function(percentage) {
		this.percentage = percentage;
		percentage /= 100;
		//percentage = percentage / (100 / 3);
		//draw the seaWallCanvas at whatever offset
		var width = this.seaWallContext.canvas.width;
		var height = this.seaWallContext.canvas.height;
		this.seaWallContext.clearRect(0, 0, width, height);
		var srcHeight = this.seaWallCanvas.height;
		this.seaWallContext.drawImage(this.seaWallCanvas, 0, srcHeight * percentage, width, srcHeight / 4, 0, 0, width, height);
	},
	makeSeaWall : function() {
		//creates an offscreen canvas with a gradient which is rendered to the background canvas
		this.seaWallCanvas = document.createElement('canvas');
		var context = this.seaWallCanvas.getContext('2d');
		var width = $(document).width();
		var height = $(document).height() * 4;
		context.canvas.width = width;
		context.canvas.height = height;
		var grd = context.createLinearGradient(0, 0, 0, height);
		// #4ba2d1 0%,#2989d8 22%,#252fc4 28%,#162d89 47%,#180E59 53%,#000000 72%
		grd.addColorStop(0, "#4ba2d1");
		grd.addColorStop(.22, "#2989d8");
		grd.addColorStop(.28, "#252fc4");
		grd.addColorStop(.47, "#162d89");
		grd.addColorStop(.53, "#180E59");
		grd.addColorStop(.72, "#000000");
		grd.addColorStop(1, "#000000");
		context.fillStyle = grd;
		context.fillRect(0, 0, width, height);
		//setup the seaWallContext
		this.$seaWall = $("#seaWall");
		this.seaWallContext = this.$seaWall[0].getContext("2d");
		this.seaWallContext.canvas.width = width;
		this.seaWallContext.canvas.height = height / 4;
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
		//gain.gain.linearRampToValueAtTime(.4, now + rampTime);
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
			MSG.route("/metro/1n", this.playSounds.bind(this));
			this.makeGains();
			//set the gain of the current zone;
			this.changeZoneSound(this.model, this.model.get("zone"));
			//start the metro
			METRO.start({
				bpm : 96,
				subdivision : ["1n", "2n", "4n", "4t", "8n", "16n"]
			});
		}
	},
	playSounds : function(msg) {
		//start the metronome
		var context = SUBMERSIBLE.context;
		if(msg.data % 8 === 0) {
			//make a buffer player and connect all of the sounds
			for(var g = 0; g < this.buffers.length; g++) {
				var gain = this.gains[g];
				var buffer = this.buffers[g];
				//make the buffer player
				var source = context.createBufferSource();
				source.buffer = buffer;
				source.loop = false;
				source.connect(gain);
				source.noteOn(msg.timetag);
			}
		}
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

	events : {
		"click #upArrowTouch" : "goUp",
		"click #downArrowTouch" : "goDown",
	},

	initialize : function() {
		this.setElement($("#cockpit"));
		this.listenTo(this.model, "change:started", this.startControls);
		//make the canvas/context
		this.$canvas = this.$el.find("#zoneIndicatorBulb");
		this.context = this.$canvas[0].getContext("2d");
		this.context.canvas.width = this.$canvas.width();
		this.context.canvas.height = this.$canvas.height();
		//draw the zone for the first time
		var zonePercent = (SUBMERSIBLE.model.get("zone") / 3) * 100;
		this.percentage = zonePercent;
		this.drawBulb(zonePercent);
		//listen for changes in the zone
		this.listenTo(SUBMERSIBLE.model, "change:zone", this.changeZone);
		//get the highlighted arrows
		this.$upArrow = this.$el.find("#upArrow");
		this.$downArrow = this.$el.find("#downArrow");
	},
	startControls : function(model, started) {
		//bind the events once it starts so it doesn't throw any errors in loading
		this.bindEvents();
	},
	bindEvents : function() {
		var self = this;
		//listen for the arrow keys
		$(document).keydown(function(e) {
			//arrow up
			if(e.keyCode === 38) {
				self.goUp(e);
				return false;
			} else if(e.keyCode === 40) {
				self.goDown(e);
				return false;
			}
		});
	},
	drawBulb : function(percent) {
		//flip the percent
		this.percentage = percent;
		percent = 100 - percent;
		var width = this.$canvas.width();
		var height = this.$canvas.height();
		var radius = Math.min(width, height) / 4;
		var x = width / 2;
		var y = height / 2;
		var context = this.context;
		context.strokeStyle = "#fff";
		context.lineWidth = 2;
		//first clear the canvas
		context.clearRect(0, 0, width, height);
		//now draw the large circle
		context.beginPath();
		context.fillStyle = "#fff";
		context.arc(x, y, radius, 0, 2 * Math.PI, false);
		context.fill();
		context.stroke();
		context.closePath();
		//now the indicator level
		context.beginPath();
		context.fillStyle = "#000";
		//var angle = Math.PI * (percent / 100);
		var indicatorHeight = radius * 2 * ((percent - 50) / 100);
		context.arc(x, y, radius, 0, Math.PI, false);
		context.moveTo(x - radius, y);
		context.bezierCurveTo(x - radius, y + indicatorHeight, x + radius, y + indicatorHeight, x + radius, y);
		context.fill();
		context.stroke();
		context.closePath();
		//also write the depth text
		context.fillStyle = "#fff"
		context.font = 'normal 10px sans-sarif';
		var depth = parseInt(INTERPOLATE.exponential(percent + 1, 1, 101, 5000, 20));
		var depthText = "depth: " + depth + "m";
		if(depth < 200) {
			var zone = "epipalegic";
		} else if(depth < 1000) {
			var zone = "mesopalegic";
		} else if(depth < 4000) {
			var zone = "bathypalegic";
		} else {
			var zone = "abyssopalegic";
		}
		context.fillText(zone, x - radius * 2.5, y + radius / 2);
		context.fillText(depthText, x - radius * 2.5, y + radius);
	},
	changeZone : function(model, zone) {
		var zonePercent = (zone / 3) * 100;
		//find the zone change
		var diff = Math.abs(zone - model.previous("zone"));
		var animationTime = 5000 * diff;
		var zoneDifference = model.get("zoneDifference");
		if(this.zoneTween) {
			this.zoneTween.stop();
		}
		var self = this;
		this.zoneTween = new TWEEN.Tween({
			percentage : self.percentage
		}).to({
			percentage : zonePercent,
		}, animationTime).easing(TWEEN.Easing.Quadratic.InOut).onUpdate(function() {
			self.drawBulb(this.percentage);
		}).start();
	},
	goUp : function(event) {
		SUBMERSIBLE.model.set("zone", SUBMERSIBLE.model.get("zone") - 1, {
			validate : true,
		});
		//put the highlight in front, and take it away after a bit
		var arrow = this.$upArrow;
		arrow.css({
			"z-index" : 100,
		})
		setTimeout(function() {
			arrow.css({
				"z-index" : -1,
			})
		}, 300)
	},
	goDown : function(event) {
		SUBMERSIBLE.model.set("zone", SUBMERSIBLE.model.get("zone") + 1, {
			validate : true,
		});
		var arrow = this.$downArrow;
		arrow.css({
			"z-index" : 100,
		})
		setTimeout(function() {
			arrow.css({
				"z-index" : -1,
			})
		}, 300)
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
