
class GraphicalScorePanel {
	constructor() {
		this.score = -1;
	}

	updateScore(score) {
		this.score = score;
	}

	draw() {
		if (this.score < 0) return;
		this.drawBackground();

		push();
		textAlign(CENTER);
		textSize(14);
		text("Score", 600, 45)

		textSize(24);
		text(this.score, 600, 75);

		pop();
	}

	drawBackground() {
		push();
		noStroke();
		fill(255, 255, 255, 200);
		rect(550, 20, 100, 70, 20);
		pop();
	}

	
}
