const AsyncArtwork = artifacts.require("./AsyncArtwork.sol");

contract("AsyncArtwork", function(accounts) {
	var artworkInstance;

	const POV_ADDRESS = "0xC5E7E2c3d3BC9B35bc6D0D27cf9eA79F37Cf6f7d"

	const TEST_OWNER_ADDRESS = "0x23e3161ec6f55B9474c6B264ab4a46c149912344"

	it ("initializes contract", function() {
		return AsyncArtwork.deployed().then(function(instance) {
	  		artworkInstance = instance;
		});
	});

	// it ("mints Hubris artwork", function() {
	//   	var artworkURI = "Qmdje2aCRquFe15oFD88jyoNrbTFUUc74xQqQMssqcZwHa";	
	//   	var controlTokenURIs = ["QmXrJCW3exLXe2iCCCeVSTais4rTW8FZgisZTHAxVLVXvC"];

	// 	// generate the end indices
	// 	var controlTokenURIEndIndex = 0;
	// 	var controlTokenURIEndIndices = []; 
	// 	for (var i = 0; i < controlTokenURIs.length; i++) {
	// 	  controlTokenURIEndIndex += controlTokenURIs[i].length;    
	// 	  controlTokenURIEndIndices.push(controlTokenURIEndIndex)    
	// 	}

	// 	var numLeversPerControlToken = [1];
	// 	var leverIds = [0];
	// 	var minValues = [0];
	// 	var maxValues = [1];
	// 	var startValues = [0];  

	// 	return artworkInstance.mintArtwork(TEST_OWNER_ADDRESS, artworkURI, controlTokenURIs.join(""), controlTokenURIEndIndices, numLeversPerControlToken, 
 //    		leverIds, minValues, maxValues, startValues).then(function(tx) {

	// 		return artworkInstance.totalSupply().then(function(supply) {
	// 			console.log(supply.toString() + " total tokens")
	// 		});
	// 	});
	// });

	it ("mints Hawking Artwork by single artist", function() {
	  	var artworkURI = "Qmdje2aCRquFe15oFD88jyoNrbTFUUc74xQqQMssqcZwHa";		  	

		var expectedArtworkTokenId = 0;
		var controlTokenArtists = [];

		var numLayers = 2;
		
		// X, Y, Rotation, Scale X, Scale Y
		var minValues = [];
		var maxValues = [];
		var startValues = [];  
		var controlTokenIds = [];

		var controlTokenURIs = [];
		for (var i = 0; i < numLayers; i++) {
			controlTokenIds.push(expectedArtworkTokenId + i + 1);
			controlTokenURIs.push(i + ".png");

			controlTokenArtists.push(POV_ADDRESS);
			
			minValues.push([0, 0, 0, 50, 50]); // x y rotation scale_x scale_y
			maxValues.push([2048, 2048, 359, 200, 200]); // x y rotation scale_x scale_y
			startValues.push([1024, 1024, 0, 100, 100]); // x y rotation scale_x scale_y	
		}

		return artworkInstance.mintArtwork(expectedArtworkTokenId, artworkURI, controlTokenArtists).then(function(tx) {
    		
    		return artworkInstance.totalSupply().then(function(supply) {
				console.log(supply.toString() + " total tokens")

				// the artwork token should be confirmed since all the control artists are the same as the POV artist
				return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {
					assert.isFalse(isConfirmed);				

					return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[0], controlTokenURIs[0],
						minValues[0], maxValues[0], startValues[0]).then(function(tx) {

						return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {
							assert.isFalse(isConfirmed);
							
							return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[1], controlTokenURIs[1],
								minValues[1], maxValues[1], startValues[1]).then(function(tx) {							

								return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {
									assert.isTrue(isConfirmed);
								});
							});
						});
					});
				});
			});
		});
	});

	// it ("mints Hawking Artwork by multiple artist", function() {
	//   	var artworkURI = "Qmdje2aCRquFe15oFD88jyoNrbTFUUc74xQqQMssqcZwHa";	
	//   	var controlTokenURIs = ["001.png", "002.png"];

	// 	// generate the end indices
	// 	var controlTokenURIEndIndex = 0;
	// 	var controlTokenURIEndIndices = []; 
	// 	for (var i = 0; i < controlTokenURIs.length; i++) {
	// 	  controlTokenURIEndIndex += controlTokenURIs[i].length;    
	// 	  controlTokenURIEndIndices.push(controlTokenURIEndIndex)    
	// 	}

	// 	var expectedArtworkTokenId = 3;
	// 	var controlTokenArtists = [POV_ADDRESS, TEST_OWNER_ADDRESS];
	// 	var numLeversPerControlToken = [5, 5];
	// 	// X, Y, Rotation, Scale X, Scale Y
	// 	var minValues = [0, 0, 0, 100, 100, 0, 0, 0, 100, 100];
	// 	var maxValues = [2048, 2048, 359, 200, 200, 2048, 2048, 359, 200, 200];
	// 	var startValues = [1024, 1024, 0, 100, 100, 1024, 1024, 0, 100, 100];  

	// 	return artworkInstance.mintArtwork(expectedArtworkTokenId, artworkURI, controlTokenArtists,
	// 		controlTokenURIs.join(""), controlTokenURIEndIndices, numLeversPerControlToken, 
 //    		minValues, maxValues, startValues).then(function(tx) {
    		
 //    		return artworkInstance.totalSupply().then(function(supply) {
	// 			console.log(supply.toString() + " total tokens")

	// 			// the artwork token should NOT be confirmed since there are different artists for each control token
	// 			return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {
	// 				assert.isFalse(isConfirmed);

	// 				// var tokenId = expectedArtworkTokenId + 1;
	// 				// console.log(tokenId);

	// 				// // this token ID should be confirmed since it's the same as the minting POV artist
	// 				// return artworkInstance.isConfirmedArtworkOrControlToken(tokenId).then(function(isConfirmed) {
	// 				// 	assert.isTrue(isConfirmed);
	// 				// });
	// 			});
	// 		});
	// 	});
	// });

	// it ("mints Bees artwork", function() {
	//   	var artworkURI = "Qmdje2aCRquFe15oFD88jyoNrbTFUUc74xQqQMssqcZwHa";	
	//   	var controlTokenURIs = ["QmXrJCW3exLXe2iCCCeVSTais4rTW8FZgisZTHAxVLVXvC"];

	// 	// generate the end indices
	// 	var controlTokenURIEndIndex = 0;
	// 	var controlTokenURIEndIndices = []; 
	// 	for (var i = 0; i < controlTokenURIs.length; i++) {
	// 	  controlTokenURIEndIndex += controlTokenURIs[i].length;    
	// 	  controlTokenURIEndIndices.push(controlTokenURIEndIndex)    
	// 	}

	// 	var numLeversPerControlToken = [3];
	// 	var leverIds = [0, 1, 2];
	// 	var minValues = [0, 0, 0];
	// 	var maxValues = [1000, 1000, 359];
	// 	var startValues = [500, 750, 0];  

	// 	return artworkInstance.mintArtwork(TEST_OWNER_ADDRESS, artworkURI, controlTokenURIs.join(""), controlTokenURIEndIndices, numLeversPerControlToken, 
 //    		leverIds, minValues, maxValues, startValues).then(function(tx) {
    		
 //    		return artworkInstance.totalSupply().then(function(supply) {
	// 			console.log(supply.toString() + " total tokens")
				
	// 			// return artworkInstance.useControlToken(3, [0], [500]).then(function(tx) {
	// 			// 	console.log(tx)
	// 			// });
	// 			return artworkInstance.tokenOfOwnerByIndex(TEST_OWNER_ADDRESS, 1).then(function(token) {
	// 				console.log(token.toString() + " token id");
	// 			});
	// 		});
	// 	});
	// });

	// it ("bids on the bee owner token", function() {
	// 	const BID_AMOUNT_ETHER = 0.1;
	// 	const TOKEN_TO_BID_ON = 0;

	// 	return web3.eth.getBalance(POV_ADDRESS).then(function(balance) {
	// 		balance = balance / (10 ** 18)

	// 		console.log("Balance before bid: " + balance)

	// 		return artworkInstance.bid(TOKEN_TO_BID_ON, {
	// 			value: web3.utils.toWei(BID_AMOUNT_ETHER.toString(), 'ether')
	// 		}).then(function(tx) {
	// 			return web3.eth.getBalance(POV_ADDRESS).then(function(balance) {
	// 				balance = balance / (10 ** 18)

	// 				console.log("Balance after bid: " + balance)

	// 				// the artwork should hold some ether now
	// 				return web3.eth.getBalance(artworkInstance.address).then(function(artworkContractBalance) {
	// 					console.log("Artwork Contract Balance: " + artworkContractBalance.toString())
	// 				});
	// 			});
	// 			// return artworkInstance.pendingBids(TOKEN_TO_BID_ON).then(function(bid) {
	// 			// 	console.log("Bidder: " + bid.bidder);
	// 			// 	console.log("Bid Amount: " + bid.amount.toString())

	// 			// 	// assert that bid amount for this token is the same
	// 			// 	assert.equal(parseInt(bid.amount.toString()), BID_AMOUNT);
	// 			// });
	// 		});
	// 	});
	// });
});