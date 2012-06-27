/*global require, JSON */
var http = require('http');
var net = require('net');
var sys = require('sys');
var io = require('socket.io');
var cs = require('../client_and_server');
var fs = require('fs');

var f = "../KinectData/2012-2-2_19-4-P1.csv";
//var f = "../KinectData/patterns.csv";
var fileData;
var init = false;
var i;
var max;

// send to Browser
var server = http.createServer(function(in_req, in_res){
    in_res.writeHeader(200, {'Content-Type': 'text/html'});
    in_res.write('<h1>Hello world</h1>');
    in_res.finish();
});
var socket = io.listen(server);

socket.on("connection", function(in_client){
	sys.log("client connected");
	in_client.on("message", function(in_message){
		sys.log("message: " + in_message);
	});
	in_client.on("forward", function(in_message){
		sys.log("forward");
		i = i + Math.round(max/10);
		if (i > max){
			i = 0;
		}
	});
	in_client.on("back", function(in_message){
		sys.log("back");
		i = i - Math.round(max/10);
		if(i<0){
			i = 0;
		}
	});
	in_client.on("start", function(in_message){
		sys.log("start");
		i = 0;
	});
	in_client.on("get", function(){
		sys.log("get request");
		if(init){
			//sys.log(fileData[i]);
			//umformatieren und antwort-strings generieren
			// {"from":{"name":"HEAD", "x":1, "y":1, "z":1}, "to":{"name":"NECK", "x":2, "y":2, "z":2}}
			var elements = fileData[i].split(';');
			var strings = new Array(19);
			// namen der joints
			var eins; var zwei; 
			// array-indizes in elements der jeweils ersten joint-koordinate
			var a; var b;
			for(j=0; j<strings.length; j++){
				switch (j){
					case 0: eins="HipCenter"; zwei="Spine"; a=1; b=5; break;
					case 1: eins="Spine"; zwei="ShoulderCenter"; a=5; b=9; break;
					case 2: eins="ShoulderCenter"; zwei="Head"; nr=0; a=9; b=13; break;
					case 3: eins="ShoulderCenter"; zwei="ShoulderLeft"; nr=0;a=9; b=17; break;
					case 4: eins="ShoulderLeft"; zwei="ElbowLeft"; nr=0; a=17; b=21; break;
					case 5: eins="ElbowLeft"; zwei="WristLeft"; nr=0; a=21; b=25; break;
					case 6: eins="WristLeft"; zwei="HandLeft"; nr=0; a=25; b=29; break;
					case 7: eins="ShoulderCenter"; zwei="ShoulderRight"; nr=0; a=9; b=33; break;
					case 8: eins="ShoulderRight"; zwei="ElbowRight"; nr=0; a=33; b=37; break;
					case 9: eins="ElbowRight"; zwei="WristRight"; nr=0; a=37; b=41; break;
					case 10: eins="WristRight"; zwei="HandRight"; nr=0; a=41; b=45; break;
					case 11: eins="HipCenter"; zwei="HipLeft"; nr=0; a=1; b=49; break;
					case 12: eins="HipLeft"; zwei="KneeLeft"; nr=0; a=49; b=53; break;
					case 13: eins="KneeLeft"; zwei="AnkleLeft"; nr=0; a=53; b=57; break;
					case 14: eins="AnkleLeft"; zwei="FootLeft"; nr=0; a=57; b=61; break;
					case 15: eins="HipCenter"; zwei="HipRight"; nr=0; a=1; b=65; break;
					case 16: eins="HipRight"; zwei="KneeRight"; nr=0; a=65; b=69; break;
					case 17: eins="KneeRight"; zwei="AnkleRight"; nr=0; a=69; b=73; break;
					case 18: eins="AnkleRight"; zwei="FootRight"; nr=0; a=73; b=77; break;
				}
				strings[j]="{\"from\":{\"name\":\"" + eins + "\", \"x\":" 
							+ elements[a].replace(",",".") + ", \"y\":" + elements[a+1].replace(",",".") + ", \"z\":" 
							+ elements[a+2].replace(",",".") + "}, \"to\":{\"name\":\"" 
							+ zwei + "\", \"x\":" + elements[b].replace(",",".") + ", \"y\":" + elements[b+1].replace(",",".") + ", \"z\":" 
							+ elements[b+2].replace(",",".") + "}}";
				//sys.log(strings[j]);
				in_client.emit("message", strings[j]);
			}
			in_client.emit("i", i);
			i++;
			sys.log("i: " + i);
			if(i==max){
				sys.log("i==max => i=0");
				i = 0;
			}
			
			//in_client.emit("message", "hello!");
		} else { //server not ready yet
		}
	});
	in_client.on("disconnect", function(){
		sys.log("client disconnected");
	});
});
server.listen(cs.MOTION_PORT);
sys.log("server listening motion port: " + cs.MOTION_PORT);
initFileData();

// read file and store in array
function initFileData(){
	sys.log("reading file...");
	fs.readFile(f, function(err,data){
			if(err) {
			sys.error("Could not open file: %s", err);
			process.exit(1);
		}
	fileData = data.toString().split('\n');
	i=0;
	max = fileData.length-1;
	init = true;
	sys.log("...reading complete");
	sys.log("Zeilenanzahl = "+ max);
	});
}

