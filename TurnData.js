
class TurnData {
	constructor() {
		// These will be set by the
		// play string processor.
		this.playString = undefined;
		this.startState = undefined;
		this.endState = undefined;
		this.player = undefined;
		this.move = undefined;
		this.location = undefined;
		this.actions = [];
	}

	////////////////////////////////////////////////////////////////////
	// Builder Methods                                                //

	addStartState(startState) {
		this.startState = startState;
	}

	addEndState(endState) {
		this.endState = endState;
	}

	addPlayer(player) {
		this.player = player;
	}

	addPlayString(playString) {
		this.playString = playString;
	}

	addMoveAndLocation(move, location) {
		this.move = move;
		this.location = location;
	}

	addAction(action) {
		this.actions.push(action);
	}

	produceNarration() {
		const player = playerIdToName(this.player);

		const start = this.startState.locations[this.player];
		const end = this.location;
		let move;
		if (this.move === LocationID.TELEPORT) {
			move = "teleported to";
		} else if (isDoubleBack(this.move)) {
			move = `double backed by ${doubleBackToNum(this.move)} to`;
		} else if (this.move === LocationID.HIDE) {
			move = "hid at";
		} else if (start === end) {
			move = "remained at";
		} else {
			move = "moved to";
		}

		const source = locationIdToName(start);
		const destination = locationIdToName(end);
		const showSource = !(start === end ||
			                 this.move === LocationID.HIDE ||
			                 start === LocationID.NOWHERE);
		this.narration = `${player} ${move} ${destination}` +
						 `${showSource ? ` from ${source}.` : "."}`;
	}

	////////////////////////////////////////////////////////////////////
	// Getters                                                        //

	getStartState() {
		return this.startState;
	}

	getEndState() {
		return this.endState;
	}

	getPlayer() {
		return this.player;
	}

	getPlayString() {
		return this.playString;
	}

	getMove() {
		return this.move;
	}

	getLocation() {
		return this.location;
	}

	getActions() {
		return this.actions;
	}

	/**
	 * Returns  a  string  containing a description of the movement that
	 * occurred this turn.
	 */
	getNarration() {
		return this.narration;
	}

	/**
	 * Returns the starting location of the player who played this turn.
	 */
	getStartLocation() {
		return this.startState.getLocation(this.player);
	}

	/**
	 * Returns  the  destination  location of the player who played this
	 * turn. (Note: This is not necessarily the same as the end location
	 * as the player could have been incapacitated.)
	 */
	getDestinationLocation() {
		return this.location;
	}
}
