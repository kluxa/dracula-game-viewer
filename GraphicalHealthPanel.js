// Health Panel - Controls how health totals are displayed on the canvas
// - No other modules should use the H_PANEL_* namespace.

////////////////////////////////////////////////////////////////////////
// Constants                                                          //

const HPANEL_L           = 800;
const HPANEL_T           =  20;

const HPANEL_W           = 365;
const HPANEL_H           = 250;

const HPANEL_MARGIN_X    =  20;
const HPANEL_MARGIN_Y    =  15;

const HPANEL_TEXT_OFFSET =  20;
const HPANEL_HBAR_OFFSET =  30;

const HPANEL_HBAR_SLANT  =   5;
const HPANEL_HBAR_H      =   6;

const HPANEL_BAR_GAP     =   6;

////////////////////////////////////////////////////////////////////////
// Derivations                                                        //

const HPANEL_R = HPANEL_L + HPANEL_W;

const HPANEL_PLAYER_H = (HPANEL_H - 2 * HPANEL_MARGIN_Y) / NUM_PLAYERS;

const HPANEL_PLAYER_L = HPANEL_L + HPANEL_MARGIN_X;
const HPANEL_PLAYER_R = HPANEL_R - HPANEL_MARGIN_X;
const HPANEL_PLAYER_T = playerId => HPANEL_T + HPANEL_MARGIN_Y + HPANEL_PLAYER_H * playerId;

const HPANEL_HBAR_T   = playerId => (HPANEL_PLAYER_T(playerId) + HPANEL_HBAR_OFFSET);

const HPANEL_HBAR_W   = HPANEL_W - 2 * HPANEL_MARGIN_X - HPANEL_HBAR_SLANT;

////////////////////////////////////////////////////////////////////////

class GraphicalHealthPanel {
	constructor() {
		this.healths = [-1, -1, -1, -1, -1];
	}

	updateHealths(healths) {
		this.healths = healths;
	}

	draw() {
		if (this.healths[0] < 0) {
			return;
		}

		this.drawBackground();
		for (let i = 0; i < NUM_PLAYERS; i++) {
			this.drawPlayerHealth(i);
		}
	}

	drawBackground() {
		push();

		noStroke();
		fill(255, 200); // Transparent white
		rect(HPANEL_L, HPANEL_T,
			 HPANEL_W, HPANEL_H,
			 20);

		pop();
	}

	drawPlayerHealth(playerId) {
		this.writeName(playerId);
		this.writeScore(playerId);
		this.drawHBar(playerId);
	}

	writeName(playerId) {
		push();

		textSize(14);
		text(playerIdToName(playerId),
			 HPANEL_PLAYER_L, 
			 HPANEL_PLAYER_T(playerId) + HPANEL_TEXT_OFFSET);

		pop();
	}

	writeScore(playerId) {
		push();

		textSize(20);
		textAlign(RIGHT);
		text(this.healths[playerId],
			 HPANEL_PLAYER_R,
			 HPANEL_PLAYER_T(playerId) + HPANEL_TEXT_OFFSET);

		pop();
	}

	drawHBar(playerId) {
		if (playerId != PlayerID.DRACULA)
			this.drawHunterHBar(playerId);
		else
			this.drawDraculaHBar(playerId);
	}

	drawHunterHBar(playerId) {
		push();
		
		stroke(0);
		strokeJoin(ROUND);
		strokeWeight(1.5);
		const fillColor = playerIdToColor(playerId);
		fill(fillColor.r, fillColor.g, fillColor.b);

		const hBarT = HPANEL_HBAR_T(playerId);
		const hBarB = hBarT + HPANEL_HBAR_H;
		const hBarL = HPANEL_PLAYER_L;
		const max = GameConstants.GAME_START_HUNTER_LIFE_POINTS;
		const barW = (HPANEL_HBAR_W - (HPANEL_BAR_GAP * (max - 1)))/max;

		// A  hunter's health bar consists of 9 separate bars - each bar
		// represents  one unit of health. We fill in the same number of
		// bars as the player's health total.
		for (let i = 0; i < max; i++) {
			if (i === this.healths[playerId]) {
				noFill();
			}

			const barL = hBarL + i * (barW + HPANEL_BAR_GAP);
			drawQuad(
				barL + HPANEL_HBAR_SLANT,        hBarT,
				barL + HPANEL_HBAR_SLANT + barW, hBarT,
				barL                     + barW, hBarB,
				barL,                            hBarB,
			);
		}

		pop();
	}

	drawDraculaHBar(playerId) {
		push();

		noStroke();
		const fillColor = playerIdToColor(playerId);
		fill(fillColor.r, fillColor.g, fillColor.b);

		const hBarT = HPANEL_HBAR_T(playerId);
		const hBarB = hBarT + HPANEL_HBAR_H;
		const hBarL = HPANEL_PLAYER_L;
		const max = GameConstants.GAME_START_BLOOD_POINTS;
		const hPercent = Math.min(this.healths[playerId], max)/max;
		const barW = hPercent * HPANEL_HBAR_W;

		// Dracula's health bar consists of a single continuous bar like
		// a  conventional HP bar. It maxes out when Dracula's health is
		// 40 or higher.
		drawQuad(
			hBarL + HPANEL_HBAR_SLANT,           hBarT,
			hBarL + HPANEL_HBAR_SLANT + barW,    hBarT,
			hBarL                     + barW,    hBarB,
			hBarL,                               hBarB,
		);

		stroke(0);
		strokeJoin(ROUND);
		strokeWeight(1.5);
		noFill();

		drawQuad(
			hBarL + HPANEL_HBAR_SLANT,           hBarT,
			HPANEL_PLAYER_R,                     hBarT,
			HPANEL_PLAYER_R - HPANEL_HBAR_SLANT, hBarB,
			hBarL,                               hBarB,
		);

		pop();
	}
}
