/*
 * METRONOME
 *
 * keeps tempo
 *
 * triggers a callback at subdivisions of 32n
 *
 * units can register to a callback on a particular subdivision (i.e. 1n, 4n, ...., 32n),
 * or on a particular bar and beat in the timeline (i.e. 8.1 = bar 8, beat 1)
 */

SUBMERSIBLE.Metronome = Backbone.Model.extend({
	name : "Metronome",

	defaults : {
		//transport attributes
		"stopped" : true,
		"beat" : -1,
		"bar" : -1,
		"meter" : [4, 4],
		"bpm" : 120,
		//beat/subdivision
		"1n" : -1,
		"2n" : -1,
		"4n" : -1,
		"8n" : -1,
		"16n" : -1,
		//the position is in fractions of a measure
		"tatums" : 0,
	},

	initialize : function(attributes, options) {
		//the smallest measurement for the metronome
		this.subdivision = 16;
		this.tatum = 0;
		//this.phase = 0;
		//make the wave watcher
		this.scriptNode = SUBMERSIBLE.context.createJavaScriptNode(2048, 1, 1);
		this.scriptNode.connect(SUBMERSIBLE.context.destination);
		//setup the callback
		this.createScriptCallback();
		//the amount of delay that's applied to all callbacks
		this.delay = 0;
		//listen to the changes
		this.on("change:bpm", this.setBPM);
		//this.on("change:4n", this.incrementBeat);
	},
	setBPM : function(model) {
		var bpm = model.get("bpm");
		if(this.clock) {
			this.clock.frequency.value = (bpm / 60) * (this.subdivision / 4);
		}
	},
	incrementBeat : function(model, beat) {

		this.set("beat", beat);
		//increment the bar on the downbeat
		if(beat === 0) {
			var bar = this.get("bar");
			this.set("bar", ++bar);
		}
		//trigger an event on this bar/beat
		//events are in the form bar.beat
		//this.trigger(bar + "." + beat);
	},
	//based on a 64th note tick
	tickTatum : function(time) {
		//put a delay on everything to avoid clicks
		time += this.delay;
		//set the attributes
		var timeSig = this.get("meter");
		var tatum = this.tatum;
		var tatumsPerMeasure = (this.subdivision * timeSig[0]) / timeSig[1];
		//set the subdivisions
		for(var i = 0; i < 5; i++) {
			var sub = Math.pow(2, i);
			var subStr = sub + "n";
			if(tatum % (tatumsPerMeasure / sub) === 0) {
				var count = this.get(subStr);
				count++;
				if(i !== 0) {
					count = count % sub;
				}
				//set the increment with the time
				this.set(subStr, count, time);
			}
		}
		//set the tatums
		this.set("tatums", this.get("bar") + (tatum / tatumsPerMeasure));
		//increment the tatum
		tatum++;
		tatum = tatum % tatumsPerMeasure;
		//increment the duration
		this.tatum = tatum;
	},
	createScriptCallback : function() {
		var self = this;
		this.scriptNode.onaudioprocess = function(event) {
			if(!self.get("stopped")) {
				//timing
				var playbackTime = SUBMERSIBLE.context.currentTime;
				var samplesToSeconds = 1 / SUBMERSIBLE.context.sampleRate;
				//process samples
				var inputBuffer = event.inputBuffer.getChannelData(0);
				var len = inputBuffer.length;
				for(var i = 0; i < len; ++i) {
					var sample = inputBuffer[i];
					var sampleTime = samplesToSeconds * i + playbackTime;
					if(sample > 0) {
						if(!self.phase) {
							self.tickTatum(sampleTime);
							self.phase = 1;
						}
					} else {
						if(self.phase) {
							self.phase = 0;
						}
					}
				}
			}
		}
	},
	//utility function for converting subdivisions to milliseconds
	subdivisionToMilliseconds : function(subdivisionString) {
		//remove the "n" from the end
		subdivisionString.substring(0, subdivisionString.length - 1);
		var subdivision = parseInt(subdivisionString);
		var beatToMS = (60 / this.get("bpm")) * (4 / subdivision) * 1000;
		return beatToMS;
	},
	start : function() {
		//create an oscillator at a 64n resolution
		this.clock = SUBMERSIBLE.context.createOscillator();
		//square wave
		this.clock.type = 1;
		//this.phase = 0;
		this.tatum = 0;
		//set bpm
		this.setBPM(this);
		this.clock.connect(this.scriptNode);
		var now = SUBMERSIBLE.context.currentTime;
		this.clock.noteOn(now);
		this.set("stopped", false);
	},
	stop : function() {
		if(this.clock) {
			var now = SUBMERSIBLE.context.currentTime;
			this.clock.noteOff(now);
			this.clock.disconnect();
		}
		//reset all the counters
		this.set({
			"stopped" : true,
			"beat" : -1,
			"bar" : -1,
			"1n" : -1,
			"2n" : -1,
			"4n" : -1,
			"8n" : -1,
			"16n" : -1,
			"32n" : -1,
		}, {
			silent : true
		});
	},
	pause : function() {
		if(this.clock) {
			var now = SUBMERSIBLE.context.currentTime;
			this.clock.noteOff(now);
			this.clock.disconnect();
		}
		this.set("stopped", true);
	},
	restart : function() {
		this.stop();
		this.start();
	},
});
