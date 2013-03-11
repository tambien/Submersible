SUBMERSIBLE.Fish = Backbone.Model.extend({

	defaults : {
		//position and movement
		direction : new THREE.Vector3(0, 0, 0),
		position : new THREE.Vector3(-100, -100, -100),
		acceleration : new THREE.Vector3(0, 0, 0),
		velocity : new THREE.Vector3(0, 0, 0),
		//the pitch and yaw of the fish
		yaw : 0,
		pitch : 0,
		//the length of a paddle
		gate : 0,
		//looks
		color: new THREE.color(0xffffff),
		image : "./images/littleFish.png",
		//the palegic zone the fish
		palegicLevel : 0,
	},

	initialize : function(attributes, options) {

	},
	
	//called when the fish is on the screen	
	paddle : function(t) {
		
	}
})