const AsyncArtwork = artifacts.require("./AsyncArtwork.sol");
const truffleAssert = require('truffle-assertions');

contract("AsyncArtwork", function(accounts) {
	var artworkInstance;
	
	it ("initializes contract", function() {
		return AsyncArtwork.deployed().then(function(instance) {
	  		artworkInstance = instance;
		});
	});

	it ("mints Bitcoin Makes the World Go Around", function() {
	  	var artworkURI = "layout.json";

	  	const ARTIST_A = "0xD68f4893e2683BE6EfE6Aab3fca65848ACAFcC05";

		var expectedArtworkTokenId = 0;

		var controlTokenArtists = [];

		var artistLayers = [ARTIST_A, ARTIST_A, ARTIST_A, ARTIST_A, ARTIST_A, ARTIST_A, ARTIST_A, ARTIST_A, ARTIST_A, ARTIST_A, ARTIST_A, ARTIST_A, ARTIST_A]
		
		// Visible
		var minValues = [];
		minValues.push([0, 0, 60]); // Layer 1 - city / BTC logo
		minValues.push([0, 0, 40]); // Layer 2 - Red A



		var maxValues = [];
		maxValues.push([359, 2, 100]) // Layer 1 - city / BTC logo
		maxValues.push([359, 359, 80]); // Layer 2 - Red A

		var startValues = [];
		startValues.push([0, 0, 67]) // Layer 1 - city / BTC logo
		startValues.push([320, 250, 50]); // Layer 2 - Red A

		var controlTokenIds = [];
		for (var i = 0; i < artistLayers.length; i++) {
			controlTokenIds.push(i + expectedArtworkTokenId + 1);

			controlTokenArtists.push(artistLayers[i]);
		}		

		var controlTokenURIs = [];
		controlTokenURIs.push("btc-city");
		
		// for (var i = 0; i < artistLayers.length; i++) {
		// 	controlTokenIds.push(expectedArtworkTokenId + i + 1);
		// 	controlTokenURIs.push("URI#" + i);

		
			
		// 	minValues.push([0]); // Visible
		// 	maxValues.push([1]); // Visible
		// 	startValues.push([0]); // Visible
		// }

		return artworkInstance.mintArtwork(expectedArtworkTokenId, artworkURI, controlTokenArtists).then(function(tx) {
		// 	return artworkInstance.totalSupply().then(function(totalSupply) {
		// 		// should be total layers count plus 1 for the base
		// 		assert(totalSupply == artistLayers.length + 1, "Wrong token count")

				var controlTokenIndex = 0;
				console.log("ControlToken = " + controlTokenIndex);
			return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[controlTokenIndex], 
				controlTokenURIs[controlTokenIndex], minValues[controlTokenIndex], maxValues[controlTokenIndex], 
				startValues[controlTokenIndex]).then(function(tx) {
						controlTokenIndex++;
			});				
		});
	});
});