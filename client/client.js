/*global DP, io, cs, THREE, Cube, JSON */
(function(){
var proxy;
var my_player;
var scene, renderer;
var socket;

// Proxy
function Proxy(){
	//var full_domain = location.href.split('/')[2].split(':')[0];
	//var full_domain = "localhost";
	//this.socket = new io.Socket(full_domain, { port: cs.MOTION_PORT }); 
	//this.socket.connect();
	socket = io.connect("http://localhost:8889");
	
	var self = this;
	//this.socket.on('connect', function(){ DP('open'); });
	socket.on('connect', function(){ DP('open'); });
	//this.socket.on('message', function(in_data){ self.handleMessage(in_data); });
	socket.on('message', function(in_data){ self.handleMessage(in_data); });
	//this.socket.on('disconnect', function(in_evt){ DP('close'); });
	socket.on('disconnect', function(in_evt){ DP('close'); });
	socket.on('i', function(in_i){ document.getElementById('caption').innerHTML = 'Frame Nummer '+in_i; });
}
Proxy.prototype.handleMessage = function(in_data){
//	DP('handleMessage:' + in_data);
//	if (in_data.indexOf('HEAD') !== -1) {
//		DP(in_data);
//	}
	var data = JSON.parse(in_data); // aufgrund der Stuktur des Strings 
									// {"from":{"name":"HEAD", "x":1, "y":1, "z":1}, "to":{"name":"HEAD", "x":2, "y":2, "z":2}}
									// werden geschachtelte Elemente erzeugt
	my_player.setPartPosition(data);
};

// Debug Objects
function DebugObjects(){
	this.threeObjects = {};
}

DebugObjects.prototype.add = function(in_id, in_x, in_y, in_z){
	if (this.threeObjects[in_id]) {
		this.remove(in_id);
	}
	var materials = [];
	for ( var i = 0; i < 6; i ++ ) {
		materials.push([new THREE.MeshBasicMaterial({ color: 0xff0000 })]);
	}
	var cube = new THREE.Mesh(new Cube(20, 20, 20, 1, 1, materials), new THREE.MeshFaceMaterial());
	cube.position.x = in_x;
	cube.position.y = in_y;
	cube.position.z = in_z;
	cube.overdraw = true;
	this.threeObjects[in_id] = cube;
	scene.addObject(cube);
};
DebugObjects.prototype.remove = function(in_id){
	scene.removeObject(this.threeObjects[in_id]);
	delete this.threeObjects[in_id];
};

// Ground
function Ground(in_size){
	//socket.emit("message", "new Ground");
	var geometry = new THREE.Geometry();
	geometry.vertices.push( new THREE.Vertex( new THREE.Vector3( -in_size / 2, 0, 0 ) ) );
	geometry.vertices.push( new THREE.Vertex( new THREE.Vector3( in_size / 2, 0, 0 ) ) );
	
	var material = new THREE.LineBasicMaterial( { color: 0xffffff, opacity: 1.0 } );
	
	var width_cell_num = 20;
	var line_num = width_cell_num + 1;
	var line;
	for (var i = 0; i < line_num; i ++) {
		line = new THREE.Line( geometry, material );
		line.position.z = (i * in_size / width_cell_num) - in_size / 2;
		scene.addObject( line );
		
		line = new THREE.Line( geometry, material );
		line.position.x = (i * in_size / width_cell_num) - in_size / 2;
		line.rotation.y = 90 * Math.PI / 180;
		scene.addObject( line );
	}
	//socket.emit("message", "Ground initialized");
}

// Part
function Part(in_id){
	//socket.emit("message", "new Part");
	this.id = in_id;
	this.geometry = new THREE.Geometry();
	this.geometry.vertices.push( new THREE.Vertex( new THREE.Vector3( 0, 0, 0 ) ) );
	this.geometry.vertices.push( new THREE.Vertex( new THREE.Vector3( 0, 0, 0 ) ) );
	
	var material = new THREE.LineBasicMaterial( { color: 0xffff00, opacity: 1.0 } );
	this.line = new THREE.Line( this.geometry, material );
	scene.addObject( this.line );

	var materials = [];
	for ( var i = 0; i < 6; i ++ ) {
		materials.push([new THREE.MeshBasicMaterial({ color: 0xff0000 })]);
	}
	this.edge1 = new THREE.Mesh(new Cube(20, 20, 20, 1, 1, materials), new THREE.MeshFaceMaterial());
	this.edge1.overdraw = true;
	scene.addObject(this.edge1);
	this.edge2 = new THREE.Mesh(new Cube(20, 20, 20, 1, 1, materials), new THREE.MeshFaceMaterial());
	this.edge2.overdraw = true;
	scene.addObject(this.edge2);
}
/*Part_old.ids = [
	'HEAD-NECK',
	'NECK-LEFT_SHOULDER',
	'LEFT_SHOULDER-LEFT_ELBOW',
	'LEFT_ELBOW-LEFT_HAND',
	'NECK-RIGHT_SHOULDER',
	'RIGHT_SHOULDER-RIGHT_ELBOW',
	'RIGHT_ELBOW-RIGHT_HAND',
	'LEFT_SHOULDER-TORSO',
	'RIGHT_SHOULDER-TORSO',
	'TORSO-LEFT_HIP',
	'LEFT_HIP-LEFT_KNEE',
	'LEFT_KNEE-LEFT_FOOT',
	'TORSO-RIGHT_HIP',
	'RIGHT_HIP-RIGHT_KNEE',
	'RIGHT_KNEE-RIGHT_FOOT',
	'LEFT_HIP-RIGHT_HIP'
];*/
Part.ids = [
	'HipCenter-Spine',
	'Spine-ShoulderCenter',
	'ShoulderCenter-Head',
	'ShoulderCenter-ShoulderLeft',
	'ShoulderLeft-ElbowLeft',
	'ElbowLeft-WristLeft',
	'WristLeft-HandLeft',
	'ShoulderCenter-ShoulderRight',
	'ShoulderRight-ElbowRight',
	'ElbowRight-WristRight',
	'WristRight-HandRight',
	'HipCenter-HipLeft',
	'HipLeft-KneeLeft',
	'KneeLeft-AnkleLeft',
	'AnkleLeft-FootLeft',
	'HipCenter-HipRight',
	'HipRight-KneeRight',
	'KneeRight-AnkleRight',
	'AnkleRight-FootRight',
];

Part.prototype.setPosition = function(in_update){
	function translate(in_update){
		return {
			from: {
				x: -in_update.from.x *1000,
				y: in_update.from.y*1000, 
				z: in_update.from.z*1000// - 1500
			},
			to: {
				x: -in_update.to.x*1000,
				y: in_update.to.y*1000,
				z: in_update.to.z*1000 //- 1500
			}
		};
	}
	var line = this.line;
	var points = translate(in_update);
	this.edge1.position.x = line.position.x = points.from.x;
	this.edge1.position.y = line.position.y = points.from.y;
	this.edge1.position.z = line.position.z = points.from.z;
	this.edge2.position.x = points.to.x;
	this.edge2.position.y = points.to.y;
	this.edge2.position.z = points.to.z;

	this.geometry.vertices[1].position.x = points.to.x - points.from.x;
	this.geometry.vertices[1].position.y = points.to.y - points.from.y;
	this.geometry.vertices[1].position.z = points.to.z - points.from.z;
	//socket.emit("message", "koordinaten: " + this.geometry.vertices[1].position.x + " " + this.geometry.vertices[1].position.y + " " + this.geometry.vertices[1].position.z);
};

// Player
function Player(in_x, in_y, in_z, in_camera){
	//socket.emit("message","new Player()");
	this.camera = in_camera;
	this.camera.position.x = in_x;
	this.camera.position.y = in_y;
	this.camera.position.z = in_z;
	this._updateCameraTarget();

	//socket.emit("message","initialize parts");
	this._parts = {};
	var len = Part.ids.length;
	for (var i = 0; i < len; i++) {
		var id = Part.ids[i];
		this._parts[id] = new Part(id);
		//socket.emit("message","new Part: "+id);
	}
}
Player.prototype.setPartPosition = function(in_update){
	//socket.emit("message","update part position: " + in_update.from.name  + '-' + in_update.to.name);
	this._parts[in_update.from.name + '-' + in_update.to.name].setPosition(in_update);
};
Player.prototype._updateCameraTarget = function(){
	this.camera.target.position.x = this.camera.position.x;
	this.camera.target.position.y = this.camera.position.y;
	this.camera.target.position.z = this.camera.position.z + 10;
};

// handler etc
function initThree() {
	//socket.emit("message", "initThree()");
	var width = window.innerWidth;
	var height = window.innerHeight;
	
	var camera = new THREE.Camera(70, width / height, 10, 10000);
	scene = new THREE.Scene();
	renderer = new THREE.CanvasRenderer();
	renderer.setSize(width, height);

	document.getElementById('container').appendChild(renderer.domElement);
	
	//socket.emit("message", "camera generated");
	return camera;
}

window.addEventListener('load', function(){
	proxy = new Proxy();
	var camera = initThree();
	my_player = new Player(0, 100, 0, camera);	
	new Ground(1000);
	debug_objects = new DebugObjects();
	
	var fps = 30;
	setInterval(function(){
		renderer.render(scene, camera);
		//socket.emit("message","render");
	}, 1000 / fps);
	setInterval(function(){
		socket.emit("get");
	}, 1000 / fps);

}, false);


function Tastendruck (Ereignis) {
  if (!Ereignis)
    Ereignis = window.event;
  if (Ereignis.keyCode == 39){  // Pfeil rechts
	socket.emit("forward");
  } else if (Ereignis.keyCode == 37){  // Pfeil links
	socket.emit("back");
  }  else if (Ereignis.keyCode == 38){  // Pfeil oben
	socket.emit("start");
  }
}
document.onkeypress = Tastendruck;


})();

