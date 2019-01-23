// Score Panel - Controls how the game score is displayed on the canvas.
// !!! No other modules should use the SCORE_PANEL_* namespace. !!!

////////////////////////////////////////////////////////////////////////
// Constants                                                          //

const SCORE_PANEL_CENTER_X = 600;
const SCORE_PANEL_CENTER_Y =  55;
const SCORE_PANEL_W =        100;
const SCORE_PANEL_H =         70;

const SCORE_PANEL_TITLE_Y =   45;
const SCORE_PANEL_SCORE_Y =   75;

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
		this.writeScore();
	}

	drawBackground() {
		push();
		
		noStroke(); // No border
		fill(255, 200); // Transparent white
		rectMode(CENTER);
		rect(SCORE_PANEL_CENTER_X, SCORE_PANEL_CENTER_Y,
			 SCORE_PANEL_W, SCORE_PANEL_H,
			 20);
		
		pop();
	}

	writeScore() {
		push();

		textAlign(CENTER);
		textSize(14);
		text("Score",
			 SCORE_PANEL_CENTER_X,
			 SCORE_PANEL_TITLE_Y);
		textSize(24);
		text(this.score,
			 SCORE_PANEL_CENTER_X,
			 SCORE_PANEL_SCORE_Y);

		pop();
	}
}
