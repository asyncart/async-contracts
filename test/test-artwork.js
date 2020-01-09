const AsyncArtwork = artifacts.require("./AsyncArtwork.sol");

// const json = require("./../build/contracts/AsyncArtwork.json");
// const contract_interface = json["abi"];

contract("AsyncArtwork", function(accounts) {
	var artworkInstance;

	const POV_ADDRESS = "0xD68f4893e2683BE6EfE6Aab3fca65848ACAFcC05"

	const TEST_OWNER_ADDRESS = "0x23e3161ec6f55B9474c6B264ab4a46c149912344"

	it ("initializes contract", function() {
		return AsyncArtwork.deployed().then(function(instance) {
	  		artworkInstance = instance;
		});
	});

	it ("mints Hubris artwork", function() {
		var title = "Hubris";
	  	var artworkURI = "Qmdje2aCRquFe15oFD88jyoNrbTFUUc74xQqQMssqcZwHa";	
	  	var controlTokenURIs = ["QmXrJCW3exLXe2iCCCeVSTais4rTW8FZgisZTHAxVLVXvC"];

		// generate the end indices
		var controlTokenURIEndIndex = 0;
		var controlTokenURIEndIndices = []; 
		for (var i = 0; i < controlTokenURIs.length; i++) {
		  controlTokenURIEndIndex += controlTokenURIs[i].length;    
		  controlTokenURIEndIndices.push(controlTokenURIEndIndex)    
		}

		var numLeversPerControlToken = [1];
		var leverIds = [0];
		var minValues = [0];
		var maxValues = [1];
		var startValues = [0];  

		return artworkInstance.mintArtwork(TEST_OWNER_ADDRESS, artworkURI, controlTokenURIs.join(""), controlTokenURIEndIndices, numLeversPerControlToken, 
    		leverIds, minValues, maxValues, startValues).then(function(tx) {
    		
    		// return artworkInstance.name().then(function(artworkName) {
    			// assert.equal(artworkName, title);

    			return artworkInstance.totalSupply().then(function(supply) {
    				console.log(supply.toString() + " total tokens")
    			});
    		// });
		});
	});

	it ("mints Bees artwork", function() {
		var title = "bees";
	  	var artworkURI = "Qmdje2aCRquFe15oFD88jyoNrbTFUUc74xQqQMssqcZwHa";	
	  	var controlTokenURIs = ["QmXrJCW3exLXe2iCCCeVSTais4rTW8FZgisZTHAxVLVXvC"];

		// generate the end indices
		var controlTokenURIEndIndex = 0;
		var controlTokenURIEndIndices = []; 
		for (var i = 0; i < controlTokenURIs.length; i++) {
		  controlTokenURIEndIndex += controlTokenURIs[i].length;    
		  controlTokenURIEndIndices.push(controlTokenURIEndIndex)    
		}

		var numLeversPerControlToken = [3];
		var leverIds = [0, 1, 2];
		var minValues = [0, 0, 0];
		var maxValues = [1000, 1000, 359];
		var startValues = [500, 750, 0];  

		return artworkInstance.mintArtwork(TEST_OWNER_ADDRESS, artworkURI, controlTokenURIs.join(""), controlTokenURIEndIndices, numLeversPerControlToken, 
    		leverIds, minValues, maxValues, startValues).then(function(tx) {
    		
    		return artworkInstance.totalSupply().then(function(supply) {
				console.log(supply.toString() + " total tokens")
				
				// return artworkInstance.useControlToken(3, [0], [500]).then(function(tx) {
				// 	console.log(tx)
				// });
				return artworkInstance.tokenOfOwnerByIndex(TEST_OWNER_ADDRESS, 1).then(function(token) {
					console.log(token.toString() + " token id");
				});
			});
		});
	});

	it ("bids on the bee owner token", function() {
		const BID_AMOUNT = 100;
		const TOKEN_TO_BID_ON = 0;

		return artworkInstance.bid(TOKEN_TO_BID_ON, {
			value: BID_AMOUNT
		}).then(function(tx) {
			return artworkInstance.pendingBids(TOKEN_TO_BID_ON).then(function(bid) {
				console.log("Bidder: " + bid.bidder);
				console.log("Bid Amount: " + bid.amount.toString())

				// assert that bid amount for this token is the same
				assert.equal(parseInt(bid.amount.toString()), BID_AMOUNT);
			});
		});
	});
});