
//* Promises for JSONs
const LOCATION_COORDS_JSON   = getJSON("data/locationCoords.json");
const CONNECTION_COORDS_JSON = getJSON("data/connectionCoords.json");
const BOUNDARY_COORDS_JSON   = getJSON("data/boundaryCoords.json");
// */

/* For local testing
const LOCATION_COORDS_JSON   = getJSON("https://api.myjson.com/bins/19v9pw");
const CONNECTION_COORDS_JSON = getJSON("https://api.myjson.com/bins/1e5l9w");
const BOUNDARY_COORDS_JSON   = getJSON("https://api.myjson.com/bins/16p8s4");
// */

const DISPLAY = new GraphicalDisplay();
const GAME_MAP = new GameMap();
const VIEW = new View();

////////////////////////////////////////////////////////////////////////
// Navigation Panel                                                   //

$('#go-to-start-button').click(() => {
	VIEW.jumpToRound(0);
});

$('#prev-turn-button').click(() => {
	VIEW.goPrevTurn();
});

$('#next-turn-button').click(() => {
	VIEW.goNextTurn();
});

$('#go-to-end-button').click(() => {
	VIEW.jumpToEnd();
});

$('#jump-to-round-button').click(() => {
	let input = $('#jump-to-round-input').val();
	if (!input.match(/^\d+$/)) return;
	let round = parseInt(input);

	if (round >= 0 && round <= VIEW.getLastRoundNo()) {
		VIEW.jumpToRound(round);
	}
});

////////////////////////////////////////////////////////////////////////
// Key Events                                                         //

$('body').keydown(e => {
	if (VIEW.history !== undefined &&
			!($('#input-moves-modal').is(':visible'))) {
		switch (e.keyCode) {
			case 36: VIEW.jumpToRound(0); break;
			case 37: VIEW.goPrevTurn();   break;
			case 39: VIEW.goNextTurn();   break;
			case 35: VIEW.jumpToEnd();    break;
		}
	}
});

////////////////////////////////////////////////////////////////////////
// Input Moves Modal                                                  //

// Generate Example Button
$('#generate-example-button').click(() => {
	let examples = [
		"GGW.... SPL.... HCA.... MCG.... DST.V.. GDU.... SLO.... HLS.... MTS.... DHIT...",
		"GKL.... SKL.... HGA.... MGA.... DCD.V.. GCDVD.. SCDD... HCDD... MCDD... DKLT... GKLTD..",
		"GSW.... SLS.... HMR.... MHA.... DSJ.V.. GLO.... SAL.... HCO.... MBR.... DBET... GED.... SBO.... HLI.... MPR.... DKLT... GLV.... SNA.... HNU.... MBD.... DCDT... GIR.... SPA.... HPR.... MKLT... DHIT... GAO.... SST.... HSZ.... MCDTTD. DGAT... GMS.... SFL.... HKL.... MSZ.... DCNT.V. GTS.... SRO.... HBC.... MCNTD.. DBS..M. GIO.... SBI.... HCN.... MCN.... DIO.... GIO.... SAS.... HBS.... MCN.... DTS.... GTS.... SAS.... HIO.... MBS.... DMS.... GMS.... SIO.... HTS.... MIO.... DAO..M. GAO.... STS.... HMS.... MTS.... DNS.... GBB.... SMS.... HAO.... MMS.... DED.V.. GNA.... SAO.... HEC.... MAO.... DMNT... GBO.... SIR.... HLE.... MEC.... DD2T... GSR.... SDU.... HBU.... MPL.... DHIT... GSN.... SIR.... HAM.... MLO.... DTPT... GAL.... SAO.... HCO.... MEC.... DCDT... GMS.... SMS.... HFR.... MLE.... DKLT.V. GTS.... STS.... HBR.... MCO.... DGAT.M. GIO.... SIO.... HBD.... MLI.... DD3T.M. GBS.... SBS.... HKLT... MBR.... DHI..M. GCN.... SCN.... HCDTTTD MVI.... DTPT... GGAT... SGA.... HSZ.... MBC.... DCDT... GCDTTD. SCDD... HKL.... MGA.... DKLT... GSZ.... SKLTD.. HKLD... MKLD... DBC.V.. GBD.... SBE.... HGA.... MBCVD.. DSOT... GSZ.... SSOTD.. HBC.... MSOD..."
	];
	$('#moves-input').val(chooseRandom(examples));
});

// Submit Moves Button
$('#submit-moves-button').click(() => {
	const input = $('#moves-input').val();
	const pastPlays = input.trim().replace(/ +/g, " ");

	if (pastPlays !== "") {
		try {
			let gameHistory = processPastPlays(pastPlays);
			$('#input-moves-modal').modal('hide');
			$('#moves-input-alert').remove();
			VIEW.setHistory(gameHistory);

			$('#start-panel').hide();
			$('#navigation-panel').show();
			$('#jump-to-round-input').attr({"max":
			    gameHistory.getLastRoundNo()
			});
		} catch (error) {
			displayError(error);
		}
	}
});

// Error Alert
function displayError(error) {
	$('#moves-input-alert').remove();
	const errorAlert = `
		<div id="moves-input-alert" class="alert alert-danger mt-3 mb-0" role="alert">
			<strong>Error: Round ${error.round}, Turn ${error.turn}</strong>
			<div>
				<strong>Play string:&nbsp</strong>
				<code style="font-size: 18px">
					${error.contextString}
					<strong>${error.playString}</strong>
				</code>
			</div>
			<div>
				<strong>Reason: </strong>
				${error.reason}
			</div>
		</div>
	`;
	$('#input-moves-modal-body').append(errorAlert);
}

function processPastPlays(pastPlays) {
	// Split the pastPlays string into an array of plays
	const allPlays = pastPlays.split(" ");

	// Try to construct a complete game history from the
	// pastPlays string.
	const gameHistory = new GameHistory();
	
	const processor = new Processor();
	for (let i = 0; i < allPlays.length; i++) {
		try {
			const turnData = processor.processNewTurn(allPlays[i]);
			turnData.produceNarration();
			gameHistory.addTurnData(turnData);
		} catch (error) {
			// Prevent mischief
			allPlays[i] = allPlays[i].replace(/<.*?>/g, "");
			if (allPlays[i].length > 10) {
				allPlays[i] = allPlays[i].slice(0, 10) + "... (truncated)";
			}

			throw({
				contextString: allPlays.slice(Math.max(0, i - 5), i).join(" "),
				playString: allPlays[i],
				...error
			});
		}
	}

	return gameHistory;
}




