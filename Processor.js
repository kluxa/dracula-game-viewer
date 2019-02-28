
/**
 * A class to process the play string for a single game.
 */
class Processor {
	constructor() {
		this.round = 0;
		this.currentPlayer = 0;

		this.score = GameConstants.GAME_START_SCORE;
		this.healths = (new Array(NUM_PLAYERS - 1))
			.fill(GameConstants.GAME_START_HUNTER_LIFE_POINTS)
			.concat([GameConstants.GAME_START_BLOOD_POINTS]);
		this.locations = (new Array(NUM_PLAYERS)).fill(LocationID.NOWHERE);
		this.locationHistory = (new Array(NUM_PLAYERS)).fill(0).map(() => []);
		this.moveHistory = (new Array(NUM_PLAYERS)).fill(0).map(() => []);
		this.hunterViewOfDrac = [];
		this.traps = [];
		this.vampireLocation = LocationID.NOWHERE;
		this.researchCombo = 0;
	}

	/**
	 * @returns A copy of the game state
	 */
	backupState() {
		return new GameState(
			this.score,
			this.healths.slice(),
			this.locations.slice(),
			this.locationHistory.map(x => x.slice()),
			this.moveHistory.map(x => x.slice()),
			this.hunterViewOfDrac.slice(),
			this.traps.map(x => x[1]),
			this.vampireLocation
		);
	}

	////////////////////////////////////////////////////////////////////
	// Processing a turn                                              //
	processNewTurn(playString) {
		// Basic validation
		if (this.gameOver()) this.errorGameOver();
		this.validatePlayStringLength(playString);
		this.validatePlayerChar(playString[0]);

		// Process the play string
		let turnData = new TurnData();
		this.processPlayerTurn(playString, turnData);

		// End-of-the-turn processing
		if (this.currentPlayer === PlayerID.DRACULA) {
			this.round++;
		}
		this.currentPlayer += 1;
		this.currentPlayer %= 5;
		return turnData;
	}

	processPlayerTurn(playString, turnData) {
		turnData.addPlayer(this.currentPlayer);
		if (this.currentPlayer !== PlayerID.DRACULA) {
			this.processHunterPreTurn();
		}

		turnData.addStartState(this.backupState());
		if (this.currentPlayer === PlayerID.DRACULA) {
			this.processDraculaTurn(playString, turnData);
		} else {
			this.processHunterTurn(playString, turnData);
		}
		if (this.healths[PlayerID.DRACULA] <= 0) {
			this.healths[PlayerID.DRACULA] = 0;
		}

		turnData.addEndState(this.backupState());
	}

	////////////////////////////////////////////////////////////////////
	// Processes a hunter's turn                                      //
	processHunterTurn(playString, turnData) {
		this.processHunterMove(playString.substring(1, 3), turnData);
		this.processHunterActions(playString.substring(3), turnData);
	}

	processHunterPreTurn() {
		if (this.getHealth() === 0) {
			this.healths[this.currentPlayer] = GameConstants.GAME_START_HUNTER_LIFE_POINTS;
		}
	}

	processHunterMove(abbrev, turnData) {
		this.validateHunterMove(abbrev);
		
		// Determine  the move and corresponding location
		const move = moveAbbrevToId(abbrev);
		const location = move;
		
		// Save the move and location in the turnData and
		// the move and location histories
		turnData.addMoveAndLocation(move, location);
		this.moveHistory[this.currentPlayer][this.round] = move;
		this.locationHistory[this.currentPlayer][this.round] = location;
		this.restAttempted = (this.getLocation() === location);
		this.locations[this.currentPlayer] = location;
		this.hunterRevealTrailByMove(location);
	}

	/**
	 * Applies the following rule:
	 * 
	 * If  a hunter moves to any city in Dracula's trail, then all moves
	 * in  the  trail  that  resulted  in Dracula being in that city are
	 * revealed.
	 * @param {number} locationId - The location the hunter moved to.
	 */
	hunterRevealTrailByMove(locationId) {
		for (let i = 1; i <= 6; i++) {
			let round = this.round - i;
			if (round < 0) break;

			if (this.getPastLocation(round, PlayerID.DRACULA) ===
					locationId && !isSea(locationId)) {
				this.revealDraculasMove(round);
			}
		}
	}

	/**
	 * Processes the action phase of a hunter's turn.
	 * @param {*} suffix 
	 */
	processHunterActions(suffix, turnData) {
		this.validateHunterActions(suffix);

		this.processHunterEncounters(suffix, turnData);
		this.checkHunterDeath(turnData);
		this.checkHunterRest(turnData);
		this.checkResearch(turnData);
	}

	processHunterEncounters(suffix, turnData) {
		for (let i = 0; i < 4; i++) {
			if (suffix[i] === 'T') {
				this.removeTrap(this.getLocation());
				this.healths[this.currentPlayer] -= GameConstants.LIFE_LOSS_TRAP_ENCOUNTER;
				turnData.addAction(ActionID.TRAP_ENCOUNTER);
			} else if (suffix[i] === 'V') {
				this.removeImmatureVampire(this.getLocation());
				turnData.addAction(ActionID.VAMPIRE_ENCOUNTER);
			} else if (suffix[i] === 'D') {
				this.healths[this.currentPlayer] -= GameConstants.LIFE_LOSS_DRACULA_ENCOUNTER;
				this.healths[PlayerID.DRACULA] -= GameConstants.LIFE_LOSS_HUNTER_ENCOUNTER;
				turnData.addAction(ActionID.DRACULA_ENCOUNTER);
			}
		}
	}

	checkHunterDeath(turnData) {
		if (this.getHealth() <= 0) {
			this.healths[this.currentPlayer] = 0;
			this.locations[this.currentPlayer] = LocationID.ST_JOSEPH_AND_ST_MARYS;
			this.score -= GameConstants.SCORE_LOSS_HUNTER_HOSPITAL;
			turnData.addAction(ActionID.HOSPITALISED);
		}
	}

	checkHunterRest(turnData) {
		if (this.getHealth() > 0 && this.restAttempted) {
			this.healths[this.currentPlayer] = Math.min(
				this.healths[this.currentPlayer] + GameConstants.LIFE_GAIN_REST,
				GameConstants.GAME_START_HUNTER_LIFE_POINTS
			);
			turnData.addAction(ActionID.REST);
			this.researchCombo++;
		} else {
			this.researchCombo = 0;
		}
	}

	checkResearch(turnData) {
		if (this.researchCombo >= 4) {
			this.revealDraculasMove(this.round - 6);
			turnData.addAction(ActionID.RESEARCH);
		}
	}

	////////////////////////////////////////////////////////////////////
	// Processes Dracula's turn                                       //
	processDraculaTurn(playString, turnData) {
		this.processDraculaMove(playString.substring(1, 3), turnData);
		this.processDraculaActions(playString.substring(3), turnData);
	}

	processDraculaMove(abbrev, turnData) {
		this.validateDraculaMove(abbrev);

		// Determine  the move and corresponding location
		const move = moveAbbrevToId(abbrev);
		const location = this.resolveDracMove(move);

		// Save the move and location in the turnData and
		// the move and location histories
		turnData.addMoveAndLocation(move, location);
		this.moveHistory[this.currentPlayer][this.round] = move;
		this.locationHistory[this.currentPlayer][this.round] = location;

		this.locations[this.currentPlayer] = location;
		this.draculaRevealTrailByMove(move, location);
	}

	/**
	 * Applies the following rule:
	 * 
	 * The  hunters can see Dracula's location whenever he ends his turn
	 * in his castle, or in a city currently occupied by a hunter.
	 * @param {number} move - The move Dracula made.
	 * @param {number} location - The corresponding location.
	 */
	draculaRevealTrailByMove(move, location) {
		if (this.draculaIsSighted()) {
			this.hunterViewOfDrac[this.round] = move;
			for (let i = 1; i < 6; i++) {
				let round = this.round - i;
				if (round < 0) break;

				if (this.getPastLocation(round) === location) {
					this.revealDraculasMove(round);
				}
			}
		} else {
			this.hunterViewOfDrac[this.round] =
					(isSea(location) ?
					LocationID.SEA_UNKNOWN :
					LocationID.CITY_UNKNOWN);
		}
	}

	draculaIsSighted() {
		let location = this.getLocation(PlayerID.DRACULA);
		if (location === LocationID.CASTLE_DRACULA) {
			return true;
		}
		if (isSea(location)) {
			return false;
		}
		for (let i = 0; i < PlayerID.DRACULA; i++) {
			if (this.getLocation(i) === location) {
				return true;
			}
		}
	}

	processDraculaActions(suffix, turnData) {
		this.validateDraculaActions(suffix);

		if (suffix[2] !== '.') {
			this.removeOldEncounter();
			if (suffix[2] === 'V') {
				this.score -= GameConstants.SCORE_LOSS_VAMPIRE_MATURES;
			}
		}

		if (suffix[0] === 'T') {
			this.traps.push([this.round, this.getLocation(PlayerID.DRACULA)]);
		}
		if (suffix[1] === 'V') {
			this.vampireLocation = this.getLocation();
		}

		if (isSea(this.getLocation())) {
			this.healths[PlayerID.DRACULA] -= GameConstants.LIFE_LOSS_SEA;
		} else if (this.getLocation() === LocationID.CASTLE_DRACULA) {
			this.healths[PlayerID.DRACULA] += GameConstants.LIFE_GAIN_CASTLE_DRACULA;
		}

		this.score -= GameConstants.SCORE_LOSS_DRACULA_TURN;
	}

	////////////////////////////////////////////////////////////////////
	// Helper Methods                                                 //

	/**
	 * Gets the health of the given player.
	 * @param {number} playerId - A  player  ID. Defaults to the current
	 *                            player's ID.
	 */
	getHealth(playerId = this.currentPlayer) {
		return this.healths[playerId];
	}

	/**
	 * Gets the location ID of the given player's location.
	 * @param {number} playerId - A  player  ID. Defaults to the current
	 *                            player's ID.
	 */
	getLocation(playerId = this.currentPlayer) {
		return this.locations[playerId];
	}

	/**
	 * Gets  the  location that a player moved to in a past round, or -1
	 * if the round hasn't happened yet.
	 * @param {number} roundNo - A round number.
	 * @param {number} playerId - A  player  ID. Defaults to the current
	 *                            player's ID.
	 */
	getPastLocation(roundNo, playerId = this.currentPlayer) {
		return this.locationHistory[playerId][roundNo];
	}

	/**
	 * Gets  the  move  that a player made in a past round, or -1 if the
	 * round hasn't happened yet.
	 * @param {number} roundNo - A round number.
	 * @param {number} playerId - A  player  ID. Defaults to the current
	 *                            player's ID.
	 */
	getPastMove(roundNo, playerId) {
		return this.moveHistory[playerId][roundNo];
	}

	/**
	 * Gets the number of traps at the given location.
	 * @param {number} locationId - A  location  ID.  Defaults to the ID
	 *                              of the current player's location.
	 */
	numTrapsAt(locationId = this.getLocation()) {
		return this.traps.filter(x => x[1] === locationId).length;
	}

	/**
	 * Gets the number of encounters at the given location.
	 * @param {number} locationId - A  location  ID.  Defaults to the ID
	 *                              of the current player's location.
	 */
	numEncountersAt(locationId = this.getLocation()) {
		return this.numTrapsAt(locationId) + (this.vampireLocation ===
			    locationId ? 1 : 0);
	}

	/**
	 * Get Dracula's trail.
	 * @returns {number[]} An array containing the IDs of the moves that
	 *                     are in Dracula's trail.
	 */
	getDraculasTrail() {
		let trail = [];
		for (let i = 1; i <= TRAIL_SIZE - 1 && this.round - i >= 0; i++) {
			trail.push(this.getPastMove(this.round - i, PlayerID.DRACULA));
		}
		return trail;
	}

	/**
	 * Resolves Dracula's move to a real location.
	 * @param {number} moveId - A move ID. 
	 */
	resolveDracMove(moveId) {
		switch (moveId) {
			case LocationID.HIDE:
				return this.getPastLocation(this.round - 1);
			case LocationID.DOUBLE_BACK_1:
				return this.getPastLocation(this.round - 1);
			case LocationID.DOUBLE_BACK_2:
				return this.getPastLocation(this.round - 2);
			case LocationID.DOUBLE_BACK_3:
				return this.getPastLocation(this.round - 3);
			case LocationID.DOUBLE_BACK_4:
				return this.getPastLocation(this.round - 4);
			case LocationID.DOUBLE_BACK_5:
				return this.getPastLocation(this.round - 5);
			case LocationID.TELEPORT:
				return LocationID.CASTLE_DRACULA;
			default:
				return moveId;
		}
	}

	/**
	 * Removes the oldest trap that is located at the given location.
	 * @param {number} locationId - A location ID.
	 */
	removeTrap(locationId) {
		let index = this.traps.findIndex(x => x[1] === locationId);
		this.traps.splice(index, 1);
	}

	/**
	 * Removes  the  immature  vampire, which is guaranteed to be at the
	 * location with the given ID.
	 * @param {number} locationId - The immature vampire's location.
	 */
	removeImmatureVampire(locationId) {
		this.vampireLocation = LocationID.NOWHERE;
	}

	/**
	 * Removes the encounter that was due to expire this round.
	 */
	removeOldEncounter() {
		if (this.round % 13 === 6) {
			this.vampireLocation = LocationID.NOWHERE;
		} else {
			this.traps.splice(0, 1);
		}
	}

	/**
	 * Reveals  Dracula's  move from the given round to the hunters. If
	 * the  move is a hide or double back, repeat on the round that the
	 * move relates to.
	 * @param {number} round - A round number.
	 */
	revealDraculasMove(round) {
		if (round < 0) return;
		let move = this.getPastMove(round, PlayerID.DRACULA);
		while (isDoubleBack(move) || move === LocationID.HIDE) {
			this.hunterViewOfDrac[round] = move;
			switch (move) {
				case LocationID.HIDE:          round -= 1; break;
				case LocationID.DOUBLE_BACK_1: round -= 1; break;
				case LocationID.DOUBLE_BACK_2: round -= 2; break;
				case LocationID.DOUBLE_BACK_3: round -= 3; break;
				case LocationID.DOUBLE_BACK_4: round -= 4; break;
				case LocationID.DOUBLE_BACK_5: round -= 5; break;
			}
			move = this.getPastMove(round, PlayerID.DRACULA);
		}
		this.hunterViewOfDrac[round] = move;
	}

	/**
	 * Reveals Dracula's move from six turns ago if the move was a hide.
	 */
	revealDraculasHide() {
		if (this.round < 6) return;
		let move = this.getPastMove(this.round - 6, PlayerID.DRACULA);
		if (move === LocationID.HIDE) {
			this.hunterViewOfDrac[this.round - 6] = move;
		}
	}

	/**
	 * Determines  whether the game is over, returning true or false, as
	 * appropriate.
	 */
	gameOver() {
		return (this.score <= 0 ||
			    this.healths[PlayerID.DRACULA] <= 0);
	}

	////////////////////////////////////////////////////////////////////
	// Validation Methods                                             //

	/**
	 * Validates the length of the given play string.
	 * @param {string} playString - A player's play string.
	 */
	validatePlayStringLength(playString) {
		if (playString.length !== 7) {
			this.errorInvalidLength();
		}
	}

	/**
	 * Validates  the  player  prefix in the most recently provided play
	 * string.
	 * @param {string} playerChar - A single character.
	 */
	validatePlayerChar(playerChar) {
		let chars = ['G', 'S', 'H', 'M', 'D'];
		if (chars[this.currentPlayer] !== playerChar) {
			this.errorWrongPlayer(playerChar);
		}
	}

	// Hunter's Turn

	/**
	 * Validates  the  move  part  of  a hunter's play string, given the
	 * current state of the game.
	 * @param {string} abbrev - A 2-letter abbreviation representing the
	 *                          hunter's move, from the play string.
	 */
	validateHunterMove(abbrev) {
		let dest = locationAbbrevToId(abbrev);
		if (!isRealLocation(dest)) {
			this.errorHunterInvalidMoveAbbrev(abbrev);
		}
		if (this.round === 0) {
			return;
		}
		if (!this.validHunterMove(this.getLocation(), dest)) {
			this.errorHunterIllegalMove(dest);
		}
	}

	validHunterMove(src, dest) {
		let maxRailHops = (this.currentPlayer + this.round) % 4;
		return (src == dest ||
				GAME_MAP.isAdjacentByRoad(src, dest) ||
				GAME_MAP.distanceByRail(src, dest) <= maxRailHops ||
				GAME_MAP.isAdjacentByBoat(src, dest));
	}

	/**
	 * Validates  the  action  part of a hunter's play string, given the
	 * current  state  of  the  game.  Requires that the hunter has been
	 * moved according to the move part of their play string.
	 * @param {string} suffix - The 4-letter suffix of the hunter's play
	 *                          string.
	 */
	validateHunterActions(suffix) {
		if (suffix != "...." && suffix != "T..." && suffix != "TT.." &&
				suffix != "TTT." && suffix != "V..." && suffix != "TV.." &&
				suffix != "TTV." && suffix != "D..." && suffix != "TD.." &&
				suffix != "TTD." && suffix != "TTTD" && suffix != "VD.." &&
				suffix != "TVD." && suffix != "TTVD") {
			this.errorHunterImpossibleSuffix(suffix);
		}

		// Traps
		let H = this.getHealth();
		let numTrapsAtLocation = this.numTrapsAt();
		let numTrapsPurported = (suffix.match(/T/g)  ||  []).length;
		let numTrapsEncountered = Math.min(numTrapsAtLocation, Math.ceil(H/2.0));
		if (numTrapsPurported > numTrapsAtLocation) {
			this.errorHunterTrapEncounterExcessive(numTrapsAtLocation, numTrapsPurported);
		} else if (numTrapsPurported > numTrapsEncountered) {
			this.errorHunterTrapEncounterAlreadyDead(numTrapsEncountered, numTrapsPurported);
		} else if (numTrapsPurported < numTrapsEncountered) {
			this.errorHunterTrapEncounterMissed(numTrapsEncountered, numTrapsPurported);
		}
		H -= 2 * numTrapsEncountered;

		// Vampire
		if (suffix.match(/V/)) {
			if (this.vampireLocation !== this.getLocation()) {
				this.errorHunterVampEncounterAbsent();
			} else if (H <= 0) {
				this.errorHunterVampEncounterAlreadyDead();
			}
		} else if (this.vampireLocation === this.getLocation() && H > 0) {
			this.errorHunterVampEncounterMissed();
		}

		// Dracula
		let draculaLocation = this.getLocation(PlayerID.DRACULA);
		if (suffix.match(/D/)) {
			if (this.getLocation() !== draculaLocation) {
				this.errorHunterDracEncounterAbsent();
			} else if (isSea(draculaLocation)) {
				this.errorHunterDracEncounterAtSea();
			} else if (H <= 0) {
				this.errorHunterDracEncounterAlreadyDead();
			}
		} else if (draculaLocation === this.getLocation() && H > 0 &&
		           !isSea(draculaLocation)) {
			this.errorHunterDracEncounterMissed();
		}
	}

	// Dracula's Turn

	/**
	 * Validates  the  move  part  of a Dracula's play string, given the
	 * current state of the game.
	 * @param {string} abbrev - A  two-letter  abbreviation representing
	 *                          Dracula's move, from the play string.
	 */
	validateDraculaMove(abbrev) {
		let move = moveAbbrevToId(abbrev);

		// Unknown move abbreviation
		if (move === LocationID.NOWHERE) {
			this.errorDraculaInvalidMoveAbbrev(abbrev);

		// City unknown or sea unknown
		} else if (move === LocationID.CITY_UNKNOWN ||
			       move === LocationID.SEA_UNKNOWN) {
			this.errorDraculaOnlyFullyRevealed();

		// Tried to move to the hospital
		} else if (move === LocationID.ST_JOSEPH_AND_ST_MARYS) {
			this.errorDraculaMovedToHospital();

		// Too early to hide/double back
		} else if (!isRealLocation(move) &&
				   earliestRoundForMove(move) > this.round) {
			this.errorDraculaTooEarlyForSpecialMove(move);

		} else if (this.round === 0) {
			return;
		
		// Dracula trying to hide at sea
		} else if (isSea(this.getLocation()) &&
				   move === LocationID.HIDE) {
			this.errorDraculaHidingAtSea();		
		}
		
		if (move === LocationID.TELEPORT) {
			this.validateTeleport();
		} else {
			let trail = this.getDraculasTrail();

			// Move already in the trail
			if ((isDoubleBack(move) && containsDoubleBack(trail)) ||
					trail.includes(move)) {
				this.errorDraculaMoveAlreadyInTrail(move);
			}

			// Move to nonadjacent place
			let src = this.getLocation();
			let dest = this.resolveDracMove(move);
			if (src != dest && !GAME_MAP.dracAdjacent(src, dest)) {
				this.errorDraculaNonAdjacentMove(move, dest);
			}
		}
	}

	/**
	 * Validates Dracula's teleport move.
	 */
	validateTeleport() {
		let trail = this.getDraculasTrail();
		let reachable = GAME_MAP.reachableByDracula(this.getLocation());
		let currLocation = this.getLocation();
		let validMoves = [];
		for (let place of reachable) {
			if (!trail.includes(place)) {
				validMoves.push(place);
			}
		}
		if (!isSea(currLocation) && !trail.includes(LocationID.HIDE)) {
			validMoves.push(LocationID.HIDE);
		}
		if (!containsDoubleBack(trail)) {
			for (let i = 1; i <= 5 && this.round - i >= 0; i++) {
				let location = this.getPastLocation(this.round - i);
				if (GAME_MAP.dracAdjacent(currLocation, location)) {
					validMoves.push(numToDoubleBack(i));
				}
			}
		}
		if (validMoves.length > 0) {
			this.errorDraculaInvalidTeleport(validMoves);
		}
	}

	/**
	 * Validate  the  action  part  of  Dracula's play string, given the
	 * current  state  of the game. Requires that Dracula has been moved
	 * according to the move part of his play string.
	 * @param {string} suffix - The  4-letter  suffix  of Dracula's play
	 *                          string.
	 */
	validateDraculaActions(suffix) {
		if (suffix != "...." && suffix != "T..." && suffix != ".V.." &&
				suffix != "..M." && suffix != "..V." && suffix != "T.M." &&
				suffix != "T.V." && suffix != ".VM." && suffix != ".VV.") {
			this.errorDraculaImpossibleSuffix(suffix);
		}

		let numEncounters = this.numEncountersAt();

		if (suffix[2] === 'M') {
			let index = this.traps.findIndex(x => x[0] === this.round - 6);
			if (index === -1) {
				this.errorDraculaInvalidMalfunction();
			} else if (this.traps[index][1] === this.getLocation()) {
				numEncounters--;
			}
		} else if (suffix[2] === 'V') {
			if (this.vampireLocation === LocationID.NOWHERE) {
				this.errorDraculaInvalidMaturation();
			} else if (this.vampireLocation === this.getLocation()) {
				numEncounters--;
			}
		} else {
			if (this.traps.findIndex(x => x[0] === this.round - 6) !== -1) {
				this.errorDraculaMissedMalfunction();
			}
			if (this.vampireLocation !== LocationID.NOWHERE &&
				    this.round % 13 === 6) {
				this.errorDraculaMissedMaturation();
			}
		}
		
		if (suffix[0] === 'T' || suffix[1] === 'V') {
			if (isSea(this.getLocation())) {
				this.errorDraculaPlacedEncounterAtSea();
			}
			if (numEncounters === 3) {
				this.errorDraculaAlreadyThreeEncounters();
			}
			if (suffix[0] === 'T' && this.round % 13 === 0) {
				this.errorDraculaWrongEncounterTrap();
			}
			if (suffix[1] === 'V' && this.round % 13 !== 0) {
				this.errorDraculaWrongEncounterVamp();
			}
		} else if (numEncounters < 3 && !isSea(this.getLocation())) {
			this.errorDraculaShouldHavePlacedEncounter();
		}
	}

	////////////////////////////////////////////////////////////////////
	// Error-Throwing Methods                                         //

	/**
	 * Throws  an  error,  providing information about the current round
	 * number, player, and the cause of the error.
	 * @param {string} message -  A message describing the source of the
	 *                            error.
	 */
	error(message = "") {
		throw({
			round: this.round,
			turn: this.currentPlayer,
			reason: message
		});
	}

	/**
	 * Throws  an  error indicating that the most recently provided play
	 * string was not seven characters long.
	 */
	errorInvalidLength() {
		this.error(`Expected a play string of length 7.`);
	}

	/**
	 * Throws  an  error  indicating  that the player prefix in the most
	 * recently provided play string did not match the expected player.
	 * @param {string} char -  The single-character player prefix in the
	 *                         most recent play string.
	 */
	errorWrongPlayer(char) {
		let expected = ['G', 'S', 'H', 'M', 'D'][this.currentPlayer];
		this.error(`Expected ${expected} as the first character of ` +
		           `the play string, got ${char} instead.`);
	}

	/**
	 * Throws  an  error indicating that a play string was provided even
	 * though the game was already over.
	 */
	errorGameOver() {
		this.error(`The game is already over.`);
	}

	// Errors in hunter's Turn

	/**
	 * Throws  an error indicating that the two-letter move given in the
	 * play string was invalid.
	 * @param {string} abbrev - The  two-letter  representation  of  the
	 *                          invalid move.
	 */
	errorHunterInvalidMoveAbbrev(abbrev) {
		if (isDraculaExclusiveMove(moveAbbrevToId(abbrev))) {
			this.error(`${abbrev} is not a valid move for a hunter.`);
		} else {
			this.error(`Unknown move abbreviation ${abbrev}.`);
		}
	}

	/**
	 * Throws an error indicating that the play string reported a hunter
	 * making an illegal move.
	 * @param {number} locationId - The  ID of the location to which the
	 *                              hunter attempted to move.
	 */
	errorHunterIllegalMove(locationId) {
		let hunterName = playerIdToName(this.currentPlayer);
		let src = locationIdToName(this.getLocation());
		let dest = locationIdToName(locationId);
		this.error(`${hunterName} cannot reach ${dest} from ${src} ` +
		           `this turn.`);
	}

	/**
	 * Throws  an  error indicating that the provided hunter play string
	 * contained an impossible suffix.
	 * @param {string} suffix - The  4-letter  suffix of a hunter's play
	 *                          string.
	 */
	errorHunterImpossibleSuffix(suffix) {
		this.error(`${suffix} is an impossible suffix for a hunter.`);
	}

	/**
	 * Throws  an  error indicating that the hunter's location contained
	 * fewer traps than was purported by the play string.
	 * @param {number} actual - The  actual number of traps contained at
	 *                          the hunter's location. 
	 * @param {number} purported - The number  of traps encountered that
	 *                             was purported by the play string.
	 */
	errorHunterTrapEncounterExcessive(actual, purported) {
		let hunterName = playerIdToName(this.currentPlayer);
		let location = locationIdToName(this.getLocation());
		let verb = (actual === 1 ? "was" : "were");
		let adverb = (actual === 0 ? "no" : "only " + actual);
		this.error(`The play string suggests that ${hunterName} ` +
				   `encountered ${purported} trap(s), but there ` +
				   `${verb} ${adverb} trap(s) at ${location}.`);
	}

	/**
	 * Throws  an  error  indicating  that  the hunter encountered fewer
	 * traps than was purported by the play string.
	 * @param {number} actual - The actual number of traps encountered. 
	 * @param {number} purported - The  number of traps encountered that
	 *                             was purported by the play string.
	 */
	errorHunterTrapEncounterAlreadyDead(actual, purported) {
		let hunterName = playerIdToName(this.currentPlayer);
		let location = locationIdToName(this.getLocation());
		let pronoun = heOrShe(this.currentPlayer);
		this.error(`${hunterName} should have encountered ${actual} ` +
				   `trap(s) at ${location}, not ${purported} as the ` +
				   `play string suggests, as ${pronoun} was incapaci` +
				   `tated after the ${ordString(actual)} trap.`);
	}

	/**
	 * Throws an error indicating that the hunter encountered more traps
	 * than was purported by the play string.
	 * @param {number} actual - The actual number of traps encountered. 
	 * @param {number} purported - The  number of traps encountered that
	 *                             was purported by the play string.
	 */
	errorHunterTrapEncounterMissed(actual, purported) {
		let hunterName = playerIdToName(this.currentPlayer);
		let location = locationIdToName(this.getLocation());
		this.error(`${hunterName} should have encountered ${actual} ` +
				   `trap(s) at ${location}, not ${purported} as the ` +
				   `play string suggests.`);
	}

	/**
	 * Throws an error indicating that the play string reported a hunter
	 * encountering  an  immature  vampire  while  there was no immature
	 * vampire at their location, which is impossible.
	 */
	errorHunterVampEncounterAbsent() {
		let hunterName = playerIdToName(this.currentPlayer);
		let location = locationIdToName(this.getLocation());
		this.error(`${hunterName} should not have encountered an ` +
				   `immature vampire, as there was no immature ` +
				   `vampire at ${location}.`);
	}

	/**
	 * Throws an error indicating that the play string reported a hunter
	 * encountering  an  immature  vampire while incapacitated, which is
	 * impossible.
	 */
	errorHunterVampEncounterAlreadyDead() {
		let hunterName = playerIdToName(this.currentPlayer);
		this.error(`Play string suggests ${hunterName} encountered an immature `  +
				   `vampire, but ${hunterName} was already incapacitated before ` +
				   `they could encounter it.`);
	}

	/**
	 * Throws  an  error  indicating  that  the  hunter  was expected to
	 * encounter  an immature vampire, but this was not reflected in the
	 * play string.
	 */
	errorHunterVampEncounterMissed() {
		let hunterName = playerIdToName(this.currentPlayer);
		let location = locationIdToName(this.getLocation());
		this.error(`${hunterName} was expected to encounter an ` +
				   `immature vampire at ${location}, but this ` +
				   `was not reflected in the play string.`);
	}

	/**
	 * Throws an error indicating that the play string reported a hunter
	 * encountering  Dracula  while  Dracula  was not at their location,
	 * which is impossible.
	 */
	errorHunterDracEncounterAbsent() {
		let hunterName = playerIdToName(this.currentPlayer);
		this.error(`Play string suggests ${hunterName} encountered Dracula at ` +
				   `${locationIdToName(this.getLocation())}, but Dracula was ` +
				   `not there.`);
	}

	/**
	 * Throws an error indicating that the play string reported a hunter
	 * encountering Dracula while incapacitated, which is impossible.
	 */
	errorHunterDracEncounterAlreadyDead() {
		let hunterName = playerIdToName(this.currentPlayer);
		this.error(`Play string suggests ${hunterName} encountered Dracula, ` +
				   `but ${hunterName} was already incapacitated before they ` +
				   `could encounter him.`);
	}

	/**
	 * Throws an error indicating that the play string reported a hunter
	 * encountering Dracula at sea, which is impossible.
	 */
	errorHunterDracEncounterAtSea() {
		let hunterName = playerIdToName(this.currentPlayer);
		this.error(`Play string suggests ${hunterName} encountered Dracula ` +
				   `at sea (${locationIdToName(this.getLocation())}), which ` +
				   `is not possible.`);
	}

	/**
	 * Throws  an  error  indicating  that  the  hunter  was expected to
	 * encounter Dracula, but this was not reflected in the play string.
	 */
	errorHunterDracEncounterMissed() {
		let hunterName = playerIdToName(this.currentPlayer);
		this.error(`${hunterName} was expected to encounter Dracula ` +
				   `at ${locationIdToName(this.getLocation())}, but ` +
				   `this was not reflected in the play string.`);
	}

	// Errors in Dracula's turn

	/**
	 * Throws  an error indicating that the two-letter move given in the
	 * play string was invalid.
	 * @param {string} abbrev - The  two-letter  representation  of  the
	 *                          invalid move.
	 */
	errorDraculaInvalidMoveAbbrev(abbrev) {
		this.error(`Unknown move abbreviation ${abbrev}.`);
	}

	/**
	 * Throws  an  error  indicating  that the Dracula play string being
	 * processed contained a C? or S? move, which is not allowed.
	 * @param {string} abbrev - "C?" or "S?".
	 */
	errorDraculaOnlyFullyRevealed(abbrev) {
		this.error(`Only fully-revealed strings are allowed, sorry!`);
	}

	/**
	 * Throws  an error indicating that the play string reported Dracula
	 * making a move that was already in his trail, which is illegal.
	 * @param {number} moveId - The move Dracula made.
	 */
	errorDraculaMoveAlreadyInTrail(moveId) {
		if (isDoubleBack(moveId)) {
			this.error(`A double back is already in Dracula's trail.`);
		} else {
			let move = moveIdToName(moveId);
			this.error(`${move} is already in Dracula's trail.`);
		}
	}

	/**
	 * Throws  an error indicating that the play string reported Dracula
	 * moving to St. Joseph and St. Marys, which is illegal.
	 */
	errorDraculaMovedToHospital() {
		this.error(`Dracula cannot move to St Joseph and St Marys!`);
	}

	/**
	 * Throws  an error indicating that the play string reported Dracula
	 * making a special move, while it was too early in the game for him
	 * to do so.
	 * @param {number} moveId - The  ID of the move Dracula attempted to
	 *                          make.
	 */
	errorDraculaTooEarlyForSpecialMove(moveId) {
		let move = moveIdToName(moveId);
		this.error(`It is too early for Dracula to use ${move}.`);
	}

	/**
	 * Throws  an error indicating that the play string reported Dracula
	 * teleporting,  even  though  there were still valid moves to make,
	 * which is illegal.
	 * @param {number[]} validMoves - An  array  of  valid moves Dracula
	 *                                could have made that round.
	 */
	errorDraculaInvalidTeleport(validMoves) {
		this.error(`Dracula cannot teleport, as these moves are still ` +
		           `valid: ${validMoves.map(moveIdToName).join(", ")}.`);
	}

	/**
	 * Throws  an error indicating that the play string reported Dracula
	 * hiding at sea, which is impossible.
	 */
	errorDraculaHidingAtSea() {
		this.error(`Dracula cannot hide at sea.`);
	}

	/**
	 * Throws  an error indicating that the play string reported Dracula
	 * moving to a non-adjacent location, which is illegal.
	 * @param {number} moveId - The move Dracula made.
	 * @param {number} locationId - The location Dracula moved to.
	 */
	errorDraculaNonAdjacentMove(moveId, locationId) {
		let move = (isDoubleBack(moveId) ? "double back" : "move");
		let src = locationIdToName(this.getLocation());
		let dest = locationIdToName(locationId);
		this.error(`Dracula cannot ${move} to ${dest}, as it is not ` +
				   `adjacent to his current location (${src}) by ` +
				   `road or by boat.`);
	}

	/**
	 * Throws  an error indicating that the provided Dracula play string
	 * contaianed an impossible suffix.
	 * @param {string} suffix - The  4-letter suffix of one of Dracula's
	 *                          play strings.
	 */
	errorDraculaImpossibleSuffix(suffix) {
		this.error(`${suffix} is an impossible suffix for Dracula.`);
	}

	/**
	 * Throws  an error indicating that the play string reported Dracula
	 * placing an encounter at sea, which is impossible.
	 */
	errorDraculaPlacedEncounterAtSea() {
		this.error(`Dracula cannot place encounters at sea.`);
	}

	/**
	 * Throws  an error indicating that the play string reported Dracula
	 * placing  an  encounter at a location that already contained three
	 * encounters, which is impossible.
	 */
	errorDraculaAlreadyThreeEncounters() {
		const location = locationIdToName(this.getLocation());
		this.error(`There are already three encounters at ${location}.`);
	}

	/**
	 * Throws  an error indicating that the play string reported Dracula
	 * placing a trap, when, in fact, he placed an immature vampire.
	 */
	errorDraculaWrongEncounterTrap() {
		this.error(`Dracula should have placed an immature vampire ` +
		           `instead of a trap in round ${this.round}.`);
	}

	/**
	 * Throws  an error indicating that the play string reported Dracula
	 * placing an immature vampire, when, in fact, he placed a trap.
	 */
	errorDraculaWrongEncounterVamp() {
		this.error(`Dracula should have placed a trap instead of an ` +
		           `immature vampire in round ${this.round}.`);
	}

	/**
	 * Throws an error indicating that Dracula placed a trap or immature
	 * vampire  this  round,  but  this  was  not  reflected in the play
	 * string.
	 */
	errorDraculaShouldHavePlacedEncounter() {
		if (this.round % 13 === 0) {
			this.error(`Dracula should have placed an immature ` +
			           `vampire in round ${this.round}.`);
		} else {
			this.error(`Dracula should have placed a trap in round ` +
			           `${this.round}.`);
		}
	}

	/**
	 * Throws  an  error indicating that the play string reported a trap
	 * malfunctioning, when, in fact, no trap malfunctioned that round.
	 */
	errorDraculaInvalidMalfunction() {
		this.error(`No traps were expected to malfunction in round ` +
		           `${this.round}.`);
	}

	/**
	 * Throws  an  error  indicating  that  the  play string reported an
	 * immature  vampire  maturing,  when,  in fact, no immature vampire
	 * matured that round.
	 */
	errorDraculaInvalidMaturation() {
		this.error(`No immature vampires were expected to mature in ` +
		           `round ${this.round}.`);
	}

	/**
	 * Throws  an  error indicating that a trap was expected to malfunc-
	 * tion that round, but this was not reflected in the play string.
	 */
	errorDraculaMissedMalfunction() {
		let id = this.getPastLocation(this.round - 6);
		let location = locationIdToName(id);
		this.error(`A trap placed in ${location} in round ` +
				   `${this.round - 6} was expected to malfunction ` +
				   `this turn, but this was not reflected in the ` +
				   `play string.`);
	}

	/**
	 * Throws  an error indicating that an immature vampire was expected
	 * to   mature  that  round,  but this was not reflected in the play
	 * string.
	 */
	errorDraculaMissedMaturation() {
		let location = locationIdToName(this.vampireLocation);
		this.error(`An immature vampire placed in ${location} in ` +
				   `round ${this.round - 6} was expected to mature ` +
				   `this turn, but this was not reflected in the ` +
				   `play string.`);
	}
}
