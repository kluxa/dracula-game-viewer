
var BACKGROUND;

function setup() {
	var canvas = createCanvas(1200, 800);
	canvas.parent('canvas');
	canvas.canvas.style.maxWidth = "1200px";
	canvas.canvas.style.maxHeight = "800px";
	canvas.canvas.style.width = "100%";
	canvas.canvas.style.height = "100%";
	BACKGROUND = loadImage("assets/europe.jpg");
}

function draw() {
	image(BACKGROUND, 0, 0);
	DISPLAY.update();
	DISPLAY.draw();
}
