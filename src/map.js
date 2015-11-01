/*
by Eamonn McHugh-Roohr

	This object deals with the star map, including dragging,
selecting (which changes the player's destination system)
and displaying each star system.

//TODO: The map drawing code needs to be more efficient.

imports
data (data.js)
systems (systems.js)
nebule (systems.js)

player (player.js)
exports */
map = {};

(function(){

var initialOffsets = { 'x':0, 'y':0 };
var ox = initialOffsets.x;
var oy = initialOffsets.y;
var mx = 0;
var my = 0;

var sizeX = 0;
var sizeY = 0;

var universeEdge;

map.setSize = function(x, y){
	sizeX = x;
	sizeY = y;
};

map.click = function(pageX, pageY){
	for(var system in systems){
		var curSys = systems[system];
		//Ugly brute force clicking-on-system check
		if(Math.abs(pageX - ox - curSys.x) < 15 && Math.abs(pageY - oy - curSys.y) < 15){
			player.selectedSystem = system;
			return false;
		}
	}
	return true;
};

map.drag = function(pageX, pageY, isDragging){
	var dx = mx - pageX;
	var dy = my - pageY;

	mx = pageX;
	my = pageY;

	if(isDragging){
		ox -= dx;
		oy -= dy;
	}
	//Not sure this is working correctly.
};

//Add in functions to click on map and select stuff

map.reset = function(){
	ox=initialOffsets.x;
	oy=initialOffsets.y;
	drawMap();
};

map.center = function(cx, cy){
	//Fine, fine.
	//ox = Math.floor(ox /*+ sizeX/2*/);
	//oy = Math.floor(cy /*+ sizeY/2*/);
};

map.draw = function(context){
	context.fillStyle = "Black";
	context.fillRect(0, 0, sizeX, sizeY);

	//drawCircle(context,universeEdge.x + ox, universeEdge.y + oy, universeEdge.radius, "White");

	//Draw background images
	var curNebula;
	for (var nebula in nebule){
		curNebula = nebule[nebula];
		context.drawImage(curNebula.img,curNebula.x + ox - (curNebula.img.width / 2), curNebula.y + oy - (curNebula.img.height / 2));
	}

	//Draw each system connection line
	context.strokeStyle = "gray";
	for (var sysName in systems) {
		if (systems.hasOwnProperty(sysName)) {
			for (var linkName in systems[sysName].links) {
				if (systems[sysName].links.hasOwnProperty(linkName)) {
					//Check and make sure that the link is valid-ie it links to a real system
					//FIXME: It should be stricter about incorrect links, since correct
					//back links could mask them.
					if(systems[systems[sysName].links[linkName]] != undefined){
						context.beginPath(); //Not sure if its faster to do a new context for each line or not-
						//further research is needed
						context.moveTo(systems[sysName].x + ox, systems[sysName].y + oy);
						context.lineTo(systems[systems[sysName].links[linkName]].x + ox, systems[systems[sysName].links[linkName]].y + oy);
						context.stroke();
					}
				}
			}
		}
	}
	//Draw hilighted route
	if(systems[player.currentSystem].links.indexOf(player.selectedSystem) > -1){
		context.moveTo(systems[player.currentSystem].x + ox, systems[player.currentSystem].y + oy);
		context.lineTo(systems[player.selectedSystem].x + ox, systems[player.selectedSystem].y + oy);
		context.strokeStyle = "green";
		context.stroke();
		context.strokeStyle = "black";
	}
	//Then draw a circle at each system's position
	var color;
	for (sysName in systems) {
		if (systems.hasOwnProperty(sysName)) {
			if(systems[sysName].govt){
				color = systems[sysName].govt.color;
			} else {
				color ='LightGray';
			}
			drawCircle(context, systems[sysName].x + ox, systems[sysName].y + oy, 4,color);
		}
	}
	//Draw a blue dot on the current system
	drawCircle(context, systems[player.currentSystem].x + ox, systems[player.currentSystem].y + oy, 2, 'Blue');

	//Draw a green dot on the selected system
	if(player.selectedSystem){
		drawCircle(context, systems[player.selectedSystem].x + ox, systems[player.selectedSystem].y + oy, 2, 'Green');
	}

	//On top of *everything* draw the text
	context.fillStyle = 'White';
	for (sysName in systems) {
		context.fillText(sysName, systems[sysName].x + 4 + ox, systems[sysName].y + 3 + oy);
	}
	for(nebula in nebule){
		context.fillText(nebule[nebula].label, nebule[nebula].x + ox, nebule[nebula].y + oy);
	}

	context.fillText( (-5 + mx - ox).toString() + ", " + (-5 + my - oy).toString(), 10, 10 );
	if(player.selectedSystem){
		if(data[player.selectedSystem].hasOwnProperty("govt")){
			context.fillStyle = data[player.selectedSystem].govt.color;
			context.fillText( "Government: ", 10, 20 );
			context.fillStyle = "White";
			context.fillText( "                       " + data[player.selectedSystem].govt.name, 10, 20 );
		}
		if(data[player.selectedSystem].hasOwnProperty("spobs")){
			for(var spob in data[player.selectedSystem].spobs){
				context.fillText( data[player.selectedSystem].spobs[spob], 10, 30 + (10 * spob) );
			}
		}
	}

};

function drawCircle(context, x, y, radius, color){
	var saveStroke = context.strokeStyle;
	context.beginPath();
	context.arc(x, y, radius, 0, 2 * Math.PI, false);
	context.strokeStyle = color;
	context.fill();
	context.stroke();
	context.strokeStyle = saveStroke;
};

map.findUniverseEdge = function(){
	/*When I go to Linear Algerbra, I promise I'll make this not suck.*/
	var eCenterX = 841;//Centered on what I think is the actual center of the universe.
	var eCenterY = 965;
	var eRad = 0;
	var tempDist = 0;
	for( var system in systems){
		tempDist = util.distance(eCenterX, eCenterY, systems[system].x, systems[system].y)
		if(eRad < tempDist){
			eRad = tempDist;
		}
	}
	universeEdge = {
		"x":eCenterX,
		"y":eCenterY,
		"radius":eRad
	};
}

})();
