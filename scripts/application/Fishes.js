/*
 * ALL THE FISH
 */

SUBMERSIBLE.BubbleCount = 25;

SUBMERSIBLE.Fishes = [
/*
 * ZONE 0
 */
/*{
	name : "sadFish",
	//after how many seconds does one appear (on average)?
	count : 10,
	attributes : {
		//specs
		size : 250,
		mass : 20,
		speed : 6,
		subdivision : "4n",
		//images
		image : "crayon-zone1fish-sequence.png",
		gifCount : 6,
		gifDuration : 300,
		//the palegic zone 0 - 3
		palegicZone : [0, 1],
		//the audio file of the fish sound
		sound : "sadFish4.mp3",
		beatRepeat : 8,
	},
}, 
*/{
	name : "greatWhite",
	count : 1,
	attributes : {
		//specs
		size : 900,
		mass : 100,
		speed : 5,
		subdivision : "4n",
		//images
		image : "Z1-GreatWhite-sequence.png",
		gifCount : 4,
		gifDuration : 800,
		//the palegic zone 0 - 3
		palegicZone : [0, 1],
		//the audio file of the fish sound
		sound : "greatWhite.mp3",
		beatRepeat : 8,
		//volume : 1.2,
	},
}, {
	name : "tuna",
	count : 3,
	attributes : {
		//specs
		size : 600,
		speed : 12,
		subdivision : "16n",
		//images
		image : "Z1-Tuna.png",
		gifCount : 1,
		gifDuration : 650,
		//the palegic zone 0 - 3
		palegicZone : [0, 1],
		//the audio file of the fish sound
		sound : "tuna3.mp3",
		beatRepeat : 8,
	},
}, {
	name : "wolfish",
	count : 3,
	attributes : {
		//specs
		size : 340,
		speed : 4.2,
		subdivision : "4n",
		//images
		image : "Z1-Wolffish.png",
		gifCount : 1,
		gifDuration : 650,
		//the palegic zone 0 - 3
		palegicZone : [0, 0],
		//the audio file of the fish sound
		sound : "wolffish2.mp3",
		beatRepeat : 4,
	},
},
{
	name : "dolphin",
	//after how many seconds does one appear (on average)?
	count : 4,
	attributes : {
		//specs
		size : 450,
		mass : 20,
		speed : 6,
		subdivision : "4n",
		//images
		image : "Z1-Dolphin.png",
		gifCount : 1,
		gifDuration : 300,
		//the palegic zone 0 - 3
		palegicZone : [0, 0],
		//the audio file of the fish sound
		sound : "dolphin2.mp3",
		beatRepeat : 8,
		//volume : .8,
	},
},
/*
 * ZONE 1
 */
{
	name : "cuddly",
	count : 3,
	attributes : {
		//specs
		size : 200,
		speed : 4.5,
		subdivision : "8n",
		//images
		image : "Z2-Cuttlefish-sequence.png",
		gifCount : 4,
		gifDuration : 250,
		//the palegic zone 0 - 3
		palegicZone : [1, 1],
		//the audio file of the fish sound
		sound : "cuttlefish2.mp3",
		beatRepeat : 8,
	},
},
{
	name : "squid",
	count : 7,
	attributes : {
		//specs
		size : 100,
		speed : 4,
		subdivision : "2n",
		//images
		image : "Z2-Squid.png",
		gifCount : 1,
		gifDuration : 650,
		//the palegic zone 0 - 3
		palegicZone : [1, 2],
		//the audio file of the fish sound
		sound : "squid2.mp3",
		beatRepeat : 4,
		//volume : .5,
	},
},
{
	name : "swordfish",
	count : 4,
	attributes : {
		//specs
		size : 550,
		speed : 14,
		subdivision : "4n",
		//images
		image : "Z2-Swordfish-Sequence.png",
		gifCount : 4,
		gifDuration : 200,
		//the palegic zone 0 - 3
		palegicZone : [0, 1],
		//the audio file of the fish sound
		sound : "swordfish3.mp3",
		beatRepeat : 6,
		//volume : .6,
	},
},
{
	name : "jelly",
	count : 3,
	attributes : {
		//specs
		size : 450,
		mass : 10,
		speed : 2,
		subdivision : "4t",
		//images
		image : "ink-jelly-sequence.png",
		gifCount : 6,
		gifDuration : 330,
		foreground : false,
		//the palegic zone 0 - 3
		palegicZone : [1, 2],
		//the audio file of the fish sound
		sound : "jelly3.mp3",
		beatRepeat : 6,
	},
},
/*
 * ZONE 2
 */
{
	name : "eel",
	count : 5,
	attributes : {
		//specs
		size : 150,
		speed : 6,
		subdivision : "2n",
		//images
		image : "Z3-Eel.png",
		gifCount : 1,
		gifDuration : 650,
		//the palegic zone 0 - 3
		palegicZone : [2, 2],
		//the audio file of the fish sound
		sound : "eel2.mp3",
		beatRepeat : 4,
		//volume : .5,
	},
},
{
	name : "angler",
	count : 3,
	attributes : {
		//specs
		size : 350,
		speed : 5,
		subdivision : "4n",
		//images
		image : "Z3-Angler-sequence.png",
		gifCount : 4,
		gifDuration : 450,
		//the palegic zone 0 - 3
		palegicZone : [2, 2],
		//the audio file of the fish sound
		sound : "angler2.mp3",
		beatRepeat : 8,
		//volume : .5,
	},
},
/*
 * ZONE 3
 */
{
	name : "orb",
	count : 10,
	attributes : {
		//specs
		size : 50,
		mass : 10,
		speed : 2,
		subdivision : "4n",
		//images
		image : "Z4-LuminescentOrb.png",
		gifCount : 1,
		gifDuration : 530,
		foreground : false,
		//the palegic zone 0 - 3
		palegicZone : [3, 3],
		//the audio file of the fish sound
		sound : "orb2.mp3",
		beatRepeat : 8,
		//volume : .6,
	},
},
{
	name : "seaPig",
	count : 3,
	attributes : {
		//specs
		size : 90,
		mass : 10,
		speed : 2,
		subdivision : "4n",
		//images
		image : "Z4-SeaPig.png",
		gifCount : 1,
		gifDuration : 530,
		foreground : false,
		//the palegic zone 0 - 3
		palegicZone : [3, 3],
		sound : "seapig.mp3",
		beatRepeat : 4,
		//volume : .4,
	},
},
{
	name : "viperfish",
	count : 0,
	attributes : {
		//specs
		size : 250,
		mass : 10,
		speed : 5,
		subdivision : "4n",
		//images
		image : "Z4-Viperfish.png",
		gifCount : 1,
		gifDuration : 530,
		foreground : false,
		//the palegic zone 0 - 3
		palegicZone : [2, 3],
		//the audio file of the fish sound
		sound : "viperfish2.mp3",
		beatRepeat : 6,
	},
},
/*
 * BACKGROUND BUBBLES
 */
{
	name : "zone0Bubble",
	count : SUBMERSIBLE.BubbleCount,
	attributes : {
		//specs
		size : 80,
		speed : 0,
		subdivision : "16n",
		beatRepeat : 15,
		sound : "bubble0_2.mp3",
		//images
		image : "radiating-bubble.png",
		gifCount : 10,
		gifDuration : 100,
		foreground : false,
		gate : 2000,
		//the palegic zone 0 - 3
		palegicZone : [0, 0],
		//if it's a bubble
		backgroundBubble : true,
	},
	/*
	 options : {
	 swim : function(ramp) {
	 var pitch = INTERPOLATE.sinusoidal(ramp, 0, 1, -1, 1);
	 //this.set("pitch", pitch);
	 this.set("vertical", pitch);
	 },
	 }
	 */
}, {
	name : "zone1Bubble",
	count : SUBMERSIBLE.BubbleCount,
	attributes : {
		//specs
		size : 80,
		speed : 0,
		subdivision : "16n",
		beatRepeat : 15,
		sound : "bubble1.mp3",
		//images
		image : "zone-2-bubble-sequence.png",
		gifCount : 8,
		gifDuration : 100,
		foreground : false,
		gate : 2000,
		//the palegic zone 0 - 3
		palegicZone : [1, 1],
		//if it's a bubble
		backgroundBubble : true,
	},
}, {
	name : "zone2Bubble",
	count : SUBMERSIBLE.BubbleCount,
	attributes : {
		//specs
		size : 80,
		speed : 0,
		subdivision : "16n",
		beatRepeat : 15,
		sound : "bubble2.mp3",
		//images
		image : "zone-3-bubble-sequence.png",
		gifCount : 8,
		gifDuration : 100,
		foreground : false,
		gate : 2000,
		//the palegic zone 0 - 3
		palegicZone : [2, 2],
		//if it's a bubble
		backgroundBubble : true,
	},
}, {
	name : "zone3Bubble",
	count : SUBMERSIBLE.BubbleCount,
	attributes : {
		//specs
		size : 80,
		speed : 0,
		subdivision : "16n",
		beatRepeat : 15,
		sound : "bubble3.mp3",
		//images
		image : "zone-4-bubble-sequence.png",
		gifCount : 6,
		gifDuration : 100,
		foreground : false,
		gate : 2000,
		//the palegic zone 0 - 3
		palegicZone : [3, 3],
		//if it's a bubble
		backgroundBubble : true,
	},
}];
