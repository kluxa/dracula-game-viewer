// Stats Panel - Controls  how locations and health totals are displayed
//               on the canvas.
// !!! No other modules should use the STATS_PANEL_* namespace. !!!

////////////////////////////////////////////////////////////////////////
// Constants                                                          //

// L = Left-X, R = Right-X, T = Top-Y, B = Bottom-Y, C = Center
// W = Width, H = Height

const STATS_PANEL_L           = 820;
const STATS_PANEL_T           =  20;

const STATS_PANEL_W           = 365;
const STATS_PANEL_H           = 240;

const STATS_PANEL_MARGIN_X    =  10;
const STATS_PANEL_MARGIN_Y    =  10;

const STATS_PANEL_LOC_W       =  32;
const STATS_PANEL_SECTION_GAP =  10;

const STATS_PANEL_TEXT_OFFSET =  20;
const STATS_PANEL_HBAR_OFFSET =  30;

const STATS_PANEL_HBAR_SLANT  =   5;
const STATS_PANEL_HBAR_H      =   6;

const STATS_PANEL_BAR_GAP     =   6;

////////////////////////////////////////////////////////////////////////
// Derivations                                                        //

const STATS_PANEL_R = STATS_PANEL_L + STATS_PANEL_W;

const STATS_PANEL_PLAYER_H = (STATS_PANEL_H - 2 * STATS_PANEL_MARGIN_Y) / NUM_PLAYERS;

const STATS_PANEL_PLAYER_T = playerId => STATS_PANEL_T + STATS_PANEL_MARGIN_Y + STATS_PANEL_PLAYER_H * playerId;

const STATS_PANEL_LOC_C_X  = STATS_PANEL_L + STATS_PANEL_MARGIN_X + (STATS_PANEL_LOC_W / 2);
const STATS_PANEL_LOC_C_Y  = playerId => STATS_PANEL_PLAYER_T(playerId) + (STATS_PANEL_PLAYER_H / 2);

const STATS_PANEL_HEALTH_L = STATS_PANEL_L + STATS_PANEL_MARGIN_X + STATS_PANEL_LOC_W + STATS_PANEL_SECTION_GAP;
const STATS_PANEL_HEALTH_R = STATS_PANEL_R - STATS_PANEL_MARGIN_X;

const STATS_PANEL_HBAR_T   = playerId => (STATS_PANEL_PLAYER_T(playerId) + STATS_PANEL_HBAR_OFFSET);

const STATS_PANEL_HBAR_W   = (STATS_PANEL_HEALTH_R - STATS_PANEL_HEALTH_L) - STATS_PANEL_HBAR_SLANT;

////////////////////////////////////////////////////////////////////////

class GraphicalStatsPanel {
	constructor() {
		this.healths = [-1, -1, -1, -1, -1];
		this.locations = [-1, -1, -1, -1, -1];
	}

	updateHealths(healths) {
		this.healths = healths;
	}

	updateLocations(locations) {
		this.locations = locations;
	}

	////////////////////////////////////////////////////////////////////
	// DRAWING                                                        //

	draw() {
		if (this.healths[0] < 0) {
			return;
		}

		this.drawBackground();
		for (let i = 0; i < this.healths.length; i++) {
			this.drawPlayerStats(i);
		}
	}

	drawBackground() {
		push();

		noStroke();
		fill(255, 200); // Transparent white
		rect(STATS_PANEL_L, STATS_PANEL_T,
			 STATS_PANEL_W, STATS_PANEL_H,
			 20);

		pop();
	}

	drawPlayerStats(playerId) {
		this.writeName(playerId);
		this.writeHealth(playerId);
		this.drawHealthBar(playerId);
		this.writeLocation(playerId);
	}

	writeName(playerId) {
		push();

		textSize(15);
		text(playerIdToName(playerId),
			 STATS_PANEL_HEALTH_L, 
			 STATS_PANEL_PLAYER_T(playerId) + STATS_PANEL_TEXT_OFFSET);

		pop();
	}

	////////////////////////////////////////////////////////////////////
	// Health                                                         //

	writeHealth(playerId) {
		push();

		textSize(20);
		textAlign(RIGHT);
		text(this.healths[playerId],
			 STATS_PANEL_HEALTH_R,
			 STATS_PANEL_PLAYER_T(playerId) + STATS_PANEL_TEXT_OFFSET);

		pop();
	}

	drawHealthBar(playerId) {
		if (playerId != PlayerID.DRACULA)
			this.drawHunterHealthBar(playerId);
		else
			this.drawDraculaHealthBar(playerId);
	}

	drawHunterHealthBar(playerId) {
		push();
		
		stroke(0);
		strokeJoin(ROUND);
		strokeWeight(1.5);
		const fillColor = playerIdToColor(playerId);
		fill(fillColor.r, fillColor.g, fillColor.b);

		const hBarT = STATS_PANEL_HBAR_T(playerId);
		const hBarB = hBarT + STATS_PANEL_HBAR_H;
		const hBarL = STATS_PANEL_HEALTH_L;
		const max = GameConstants.GAME_START_HUNTER_LIFE_POINTS;
		const barW = (STATS_PANEL_HBAR_W - (STATS_PANEL_BAR_GAP * (max - 1)))/max;

		// A  hunter's health bar consists of 9 separate bars - each bar
		// represents  one unit of health. We fill in the same number of
		// bars as the player's health total.
		for (let i = 0; i < max; i++) {
			if (i === this.healths[playerId]) {
				noFill();
			}

			const barL = hBarL + i * (barW + STATS_PANEL_BAR_GAP);
			drawQuad(
				barL + STATS_PANEL_HBAR_SLANT,             hBarT,
				barL + STATS_PANEL_HBAR_SLANT + barW,      hBarT,
				barL                          + barW,      hBarB,
				barL,                                      hBarB,
			);
		}

		pop();
	}

	drawDraculaHealthBar(playerId) {
		push();

		noStroke();
		const fillColor = playerIdToColor(playerId);
		fill(fillColor.r, fillColor.g, fillColor.b);

		const hBarT = STATS_PANEL_HBAR_T(playerId);
		const hBarB = hBarT + STATS_PANEL_HBAR_H;
		const hBarL = STATS_PANEL_HEALTH_L;
		const max = GameConstants.GAME_START_BLOOD_POINTS;
		const hPercent = Math.min(this.healths[playerId], max)/max;
		const barW = hPercent * STATS_PANEL_HBAR_W;

		// Dracula's health bar consists of a single continuous bar like
		// a  conventional HP bar. It maxes out when Dracula's health is
		// 40 or higher.
		drawQuad(
			hBarL + STATS_PANEL_HBAR_SLANT,                hBarT,
			hBarL + STATS_PANEL_HBAR_SLANT + barW,         hBarT,
			hBarL                          + barW,         hBarB,
			hBarL,                                         hBarB,
		);

		stroke(0);
		strokeJoin(ROUND);
		strokeWeight(1.5);
		noFill();

		drawQuad(
			hBarL + STATS_PANEL_HBAR_SLANT,                hBarT,
			STATS_PANEL_HEALTH_R,                          hBarT,
			STATS_PANEL_HEALTH_R - STATS_PANEL_HBAR_SLANT, hBarB,
			hBarL,                                         hBarB,
		);

		pop();
	}

	////////////////////////////////////////////////////////////////////
	// Location                                                       //

	writeLocation(playerId) {
		push();

		const locationId = this.locations[playerId];
		const type = locationIdToType(locationId);
		const abbrev = locationIdToAbbrev(locationId);

		stroke(0);
		strokeWeight(1.5);
		fill(locationTypeToColor(type));
		ellipse(STATS_PANEL_LOC_C_X,
				STATS_PANEL_LOC_C_Y(playerId),
				STATS_PANEL_LOC_W);

		noStroke();
		fill(this.locationTypeToAbbrevColor(type));
		textSize(14);
		textAlign(CENTER, CENTER);
		text(`${abbrev}`,
				STATS_PANEL_LOC_C_X,
				STATS_PANEL_LOC_C_Y(playerId));
		
		pop();
	}

	locationTypeToAbbrevColor(type) {
		switch (type) {
			case LocationType.INLAND_CITY: return   0;
			case LocationType.PORT_CITY:   return   0;
			case LocationType.SEA:         return 255;
			default:                       return   0;
		}
	}

}
