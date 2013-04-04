/*
 * METRONOME
 *
 * keeps tempo
 */

( function() {

	//the METRONOME object
	window.METRO = window.METRO || {};

	/**************************************************************************
	 BEATS
	 *************************************************************************/

	//the durations of all the beats
	var beatDurations = {
		"1n" : 0,
		"2n" : 0,
		"2t" : 0,
		"4n" : 0,
		"4t" : 0,
		"8n" : 0,
		"8t" : 0,
		"16n" : 0,
		"16t" : 0,
		"32n" : 0,
		"32t" : 0,
	}

	//the durations of all the beats
	var beatsPerMeasure = {
		"1n" : 1,
		"2n" : 2,
		"2t" : 3,
		"4n" : 4,
		"4t" : 6,
		"8n" : 8,
		"8t" : 12,
		"16n" : 16,
		"16t" : 24,
		"32n" : 32,
		"32t" : 48,
	}

	// the subdivisions of the measure in 4/4 time
	var measureSubdivision = {
		"1n" : 1,
		"2n" : 2,
		"2t" : 3,
		"4n" : 4,
		"4t" : 6,
		"8n" : 8,
		"8t" : 12,
		"16n" : 16,
		"16t" : 24,
		"32n" : 32,
		"32t" : 48,
	}

	//the default subdivisions which the metronome ticks on
	var tickOn = ["1n", '4n', '8n'];

	/**************************************************************************
	 TEMPO and TIME SIGNATURE
	 *************************************************************************/

	//some default values
	var bpm = 120;
	var timeSignature = [4, 4];

	//sets the tempo, either instantly or over a period of time
	function setTempo(bpm) {
		var timeSigRatio = timeSignature[0] / timeSignature[1];
		var measureInSeconds = (60 / bpm) * 4 * timeSigRatio;
		//set the durations of all the subdivisions
		for(beat in beatDurations) {
			var BperM = beatsPerMeasure[beat];
			var subTime = measureInSeconds / BperM;
			beatDurations[beat] = subTime;
		}
	};

	//updates the time siganture
	function setTimeSignature(timeSig) {
		timeSignature = timeSig;
		//update the beats per measure object
		for(subdivision in measureSubdivision) {
			//don't count 1n since that's always 1
			if(subdivision !== '1n') {
				var beatCount = parseInt(measureSubdivision[subdivision] * (timeSig[0] / timeSig[1]));
				beatsPerMeasure[subdivision] = beatCount;
			}
		}
	};

	//state is either 'counting', 'stopped', or 'paused'
	var state = 'stopped';

	/**************************************************************************
	 ECHO
	 *************************************************************************/

	//this function schedules a new message when one is recieved
	function echo(msg) {
		//get the subdivision from the address
		var sub = msg.address.split("/")[2];
		//increment the counter
		var count = msg.data + 1;
		//roll over when the beat has reached it's max for that subdivision
		if(sub !== '1n') {
			var max = beatsPerMeasure[sub];
			count = count % max;
		}
		//get the next beat time
		var nextTime = msg.timetag + beatDurations[sub];
		//schedule the new msg
		MSG.schedule({
			address : msg.address,
			timetag : nextTime,
			data : count,
		});
	}

	/**************************************************************************
	 CONTROLS
	 *************************************************************************/

	METRO.start = function(args) {
		//set the state
		state = 'counting';
		//parse the arguments
		args = args || {};
		var tempo = args.bpm || bpm;
		var timeSig = args.timeSignature || timeSignature;
		var subdivision = args.subdivision || tickOn;
		var delay = args.delay || 0;
		setTimeSignature(timeSig);
		setTempo(tempo);
		//schedule the first messages
		var now = audioContext.currentTime + delay;
		for(var s = 0; s < subdivision.length; s++) {
			var sub = subdivision[s];
			MSG.schedule({
				address : "/metro/" + sub,
				timetag : now,
				//starts with a count of 0
				data : 0,
			})
		}
		//add the msg listener
		MSG.route("/metro/*", echo);
	};

	METRO.stop = function(when) {
		//set the state
		state = 'stopped';
		//unroute all the messages
	};

	METRO.pause = function(when) {
		//set the state
		state = 'paused';
		//unroute all the messages
	};
}());
