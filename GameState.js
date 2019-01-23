
/**
 * A class representing the state of the game.
 */
class GameState {
	/**
	 * Creates a new game state.
	 */
	constructor(score, healths, locations, locationHistory,
				moveHistory, hunterViewOfDrac, traps,
				vampireLocation) {
		this.score = score;
		this.healths = healths;
		this.locations = locations;
		this.locationHistory = locationHistory;
		this.moveHistory = moveHistory;
		this.hunterViewOfDrac = hunterViewOfDrac;
		this.traps = traps;
		this.vampireLocation = vampireLocation;
	}

	////////////////////////////////////////////////////////////////////
	// Getters                                                        //

	getScore() {
		return this.score;
	}

	getHealths() {
		return this.healths.slice();
	}

	getHealth(playerId) {
		return this.healths[playerId];
	}

	getLocations() {
		return this.locations.slice();
	}

	getLocation(playerId) {
		return this.locations[playerId];
	}

	getPastLocation(round, playerId) {
		return this.locationHistory[playerId][round];
	}
	
	getPastMove(round, playerId) {
		return this.locationHistory[playerId][round];
	}

	getTrapLocations() {
		return this.traps.map(x => x[1]);
	}

	getVampireLocation() {
		return this.vampireLocation;
	}

	getDracTrailLocations() {
		console.log(this);
		const history = this.locationHistory[PlayerID.DRACULA];
		console.log(history);
		return history.slice(Math.max(0, history.length - TRAIL_SIZE));
	}
}
