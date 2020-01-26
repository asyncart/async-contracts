const AsyncArtwork = artifacts.require("./AsyncArtwork.sol");
const truffleAssert = require('truffle-assertions');

contract("AsyncArtwork", function(accounts) {
	var artworkInstance;

	// POV Address
	const ARTIST_A = "0xD68f4893e2683BE6EfE6Aab3fca65848ACAFcC05";
	const ARTIST_B = "0xaa60e4BC5f613C3d51f6b7e6EF174B18a944fada"
	const ARTIST_C = "0xe1DB628f388557B775e49A757288b81D619F08C0"

	const COLLECTOR_A = "0x23e3161ec6f55B9474c6B264ab4a46c149912344"
	const COLLECTOR_B = "0xab40Aa5942182288E280e166F46B683CF1FAb1A5"

	const NEW_PLATFORM_ADDRESS = "0xD024C0CFE9881da3998C78B1Eccd56b75ccC3Ec8";


	it ("initializes contract", function() {
		return AsyncArtwork.deployed().then(function(instance) {
	  		artworkInstance = instance;
		});
	});

	it ("mints Mona by artist A", function() {
	  	var artworkURI = "Qmdje2aCRquFe15oFD88jyoNrbTFUUc74xQqQMssqcZwHa";		  	

		var expectedArtworkTokenId = 0;
		var controlTokenArtists = [];

		var artistLayers = [ARTIST_A]
		
		// Visible
		var minValues = [];
		var maxValues = [];
		var startValues = [];  
		var controlTokenIds = [];

		var controlTokenURIs = [];
		for (var i = 0; i < artistLayers.length; i++) {
			controlTokenIds.push(expectedArtworkTokenId + i + 1);
			controlTokenURIs.push("URI#" + i);

			controlTokenArtists.push(artistLayers[i]);
			
			minValues.push([0]); // Visible
			maxValues.push([1]); // Visible
			startValues.push([0]); // Visible
		}

		return artworkInstance.mintArtwork(expectedArtworkTokenId, artworkURI, controlTokenArtists).then(function(tx) {
			return artworkInstance.totalSupply().then(function(totalSupply) {
				// should be total layers count plus 1 for the base
				assert(totalSupply == artistLayers.length + 1, "Wrong token count")

				var controlTokenIndex = 0;
				
				return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[controlTokenIndex], controlTokenURIs[controlTokenIndex],
					minValues[controlTokenIndex], maxValues[controlTokenIndex], startValues[controlTokenIndex]).then(function(tx) {
				});
			});
		});
	});
});