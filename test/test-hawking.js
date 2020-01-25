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

	it ("mints Hawking by artist A", function() {
	  	var artworkURI = "Qmdje2aCRquFe15oFD88jyoNrbTFUUc74xQqQMssqcZwHa";		  	

		var expectedArtworkTokenId = 0;
		var controlTokenArtists = [];

		var artistLayers = [ARTIST_A, ARTIST_B, ARTIST_C, ARTIST_C, ARTIST_C]
		
		// X, Y, Rotation, Scale X, Scale Y
		var minValues = [];
		var maxValues = [];
		var startValues = [];  
		var controlTokenIds = [];

		var controlTokenURIs = [];
		for (var i = 0; i < artistLayers.length; i++) {
			controlTokenIds.push(expectedArtworkTokenId + i + 1);
			controlTokenURIs.push("URI#" + i);

			controlTokenArtists.push(artistLayers[i]);
			
			minValues.push([0, 0, 0, 50, 50]); // x y rotation scale_x scale_y
			maxValues.push([2048, 2048, 359, 200, 200]); // x y rotation scale_x scale_y
			startValues.push([1024, 1024, 0, 100, 100]); // x y rotation scale_x scale_y	
		}

		return artworkInstance.mintArtwork(expectedArtworkTokenId, artworkURI, controlTokenArtists).then(function(tx) {
			return artworkInstance.totalSupply().then(function(totalSupply) {
				// should be total layers count plus 1 for the base
				assert(totalSupply == artistLayers.length + 1, "Wrong token count")

				return artworkInstance.whitelistedCreators(ARTIST_A).then(function(isWhitelisted) {
					assert(isWhitelisted, "Should be whitelisted")

					return artworkInstance.whitelistedCreators(COLLECTOR_A).then(function(isWhitelisted) {
						assert(!isWhitelisted, "Should NOT be whitelisted")
					})
				})
			});
			// var controlTokenIndex = 0;
			
			// return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[controlTokenIndex], 
			// 	controlTokenURIs[controlTokenIndex], minValues[controlTokenIndex], maxValues[controlTokenIndex], 
			// 	startValues[controlTokenIndex]).then(function(tx) {

			// 	return artworkInstance.getControlToken(1).then(function(leverValues) {
			// 		for (var i = 0; i < leverValues.length; i++) {
			// 			console.log(leverValues[i].toString());
			// 		}
			// 	});				
			// });
		});
			// 	var controlTokenIndex = 0;
				
			// 	// generated from recursive.py
			// 	// console.log("ControlToken = " + controlTokenIndex);return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[controlTokenIndex], controlTokenURIs[controlTokenIndex], minValues[controlTokenIndex], maxValues[controlTokenIndex], startValues[controlTokenIndex]).then(function(tx) {controlTokenIndex++;return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {console.log("Is confirmed = " + isConfirmed);console.log("ControlToken = " + controlTokenIndex);return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[controlTokenIndex], controlTokenURIs[controlTokenIndex], minValues[controlTokenIndex], maxValues[controlTokenIndex], startValues[controlTokenIndex]).then(function(tx) {controlTokenIndex++;return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {console.log("Is confirmed = " + isConfirmed);console.log("ControlToken = " + controlTokenIndex);return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[controlTokenIndex], controlTokenURIs[controlTokenIndex], minValues[controlTokenIndex], maxValues[controlTokenIndex], startValues[controlTokenIndex]).then(function(tx) {controlTokenIndex++;return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {console.log("Is confirmed = " + isConfirmed);console.log("ControlToken = " + controlTokenIndex);return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[controlTokenIndex], controlTokenURIs[controlTokenIndex], minValues[controlTokenIndex], maxValues[controlTokenIndex], startValues[controlTokenIndex]).then(function(tx) {controlTokenIndex++;return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {console.log("Is confirmed = " + isConfirmed);console.log("ControlToken = " + controlTokenIndex);return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[controlTokenIndex], controlTokenURIs[controlTokenIndex], minValues[controlTokenIndex], maxValues[controlTokenIndex], startValues[controlTokenIndex]).then(function(tx) {controlTokenIndex++;return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {console.log("Is confirmed = " + isConfirmed);console.log("ControlToken = " + controlTokenIndex);return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[controlTokenIndex], controlTokenURIs[controlTokenIndex], minValues[controlTokenIndex], maxValues[controlTokenIndex], startValues[controlTokenIndex]).then(function(tx) {controlTokenIndex++;return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {console.log("Is confirmed = " + isConfirmed);console.log("ControlToken = " + controlTokenIndex);return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[controlTokenIndex], controlTokenURIs[controlTokenIndex], minValues[controlTokenIndex], maxValues[controlTokenIndex], startValues[controlTokenIndex]).then(function(tx) {controlTokenIndex++;return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {console.log("Is confirmed = " + isConfirmed);console.log("ControlToken = " + controlTokenIndex);return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[controlTokenIndex], controlTokenURIs[controlTokenIndex], minValues[controlTokenIndex], maxValues[controlTokenIndex], startValues[controlTokenIndex]).then(function(tx) {controlTokenIndex++;return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {console.log("Is confirmed = " + isConfirmed);console.log("ControlToken = " + controlTokenIndex);return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[controlTokenIndex], controlTokenURIs[controlTokenIndex], minValues[controlTokenIndex], maxValues[controlTokenIndex], startValues[controlTokenIndex]).then(function(tx) {controlTokenIndex++;return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {console.log("Is confirmed = " + isConfirmed);console.log("ControlToken = " + controlTokenIndex);return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[controlTokenIndex], controlTokenURIs[controlTokenIndex], minValues[controlTokenIndex], maxValues[controlTokenIndex], startValues[controlTokenIndex]).then(function(tx) {controlTokenIndex++;return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {console.log("Is confirmed = " + isConfirmed);console.log("ControlToken = " + controlTokenIndex);return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[controlTokenIndex], controlTokenURIs[controlTokenIndex], minValues[controlTokenIndex], maxValues[controlTokenIndex], startValues[controlTokenIndex]).then(function(tx) {controlTokenIndex++;return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {console.log("Is confirmed = " + isConfirmed);console.log("ControlToken = " + controlTokenIndex);return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[controlTokenIndex], controlTokenURIs[controlTokenIndex], minValues[controlTokenIndex], maxValues[controlTokenIndex], startValues[controlTokenIndex]).then(function(tx) {controlTokenIndex++;return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {console.log("Is confirmed = " + isConfirmed);console.log("ControlToken = " + controlTokenIndex);return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[controlTokenIndex], controlTokenURIs[controlTokenIndex], minValues[controlTokenIndex], maxValues[controlTokenIndex], startValues[controlTokenIndex]).then(function(tx) {controlTokenIndex++;return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {console.log("Is confirmed = " + isConfirmed);console.log("ControlToken = " + controlTokenIndex);return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[controlTokenIndex], controlTokenURIs[controlTokenIndex], minValues[controlTokenIndex], maxValues[controlTokenIndex], startValues[controlTokenIndex]).then(function(tx) {controlTokenIndex++;return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {console.log("Is confirmed = " + isConfirmed);console.log("ControlToken = " + controlTokenIndex);return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[controlTokenIndex], controlTokenURIs[controlTokenIndex], minValues[controlTokenIndex], maxValues[controlTokenIndex], startValues[controlTokenIndex]).then(function(tx) {controlTokenIndex++;return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {console.log("Is confirmed = " + isConfirmed);console.log("ControlToken = " + controlTokenIndex);return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[controlTokenIndex], controlTokenURIs[controlTokenIndex], minValues[controlTokenIndex], maxValues[controlTokenIndex], startValues[controlTokenIndex]).then(function(tx) {controlTokenIndex++;return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {console.log("Is confirmed = " + isConfirmed);console.log("ControlToken = " + controlTokenIndex);return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[controlTokenIndex], controlTokenURIs[controlTokenIndex], minValues[controlTokenIndex], maxValues[controlTokenIndex], startValues[controlTokenIndex]).then(function(tx) {controlTokenIndex++;return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {console.log("Is confirmed = " + isConfirmed);console.log("ControlToken = " + controlTokenIndex);return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[controlTokenIndex], controlTokenURIs[controlTokenIndex], minValues[controlTokenIndex], maxValues[controlTokenIndex], startValues[controlTokenIndex]).then(function(tx) {controlTokenIndex++;return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {console.log("Is confirmed = " + isConfirmed);console.log("ControlToken = " + controlTokenIndex);return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[controlTokenIndex], controlTokenURIs[controlTokenIndex], minValues[controlTokenIndex], maxValues[controlTokenIndex], startValues[controlTokenIndex]).then(function(tx) {controlTokenIndex++;return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {console.log("Is confirmed = " + isConfirmed);console.log("ControlToken = " + controlTokenIndex);return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[controlTokenIndex], controlTokenURIs[controlTokenIndex], minValues[controlTokenIndex], maxValues[controlTokenIndex], startValues[controlTokenIndex]).then(function(tx) {controlTokenIndex++;return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {console.log("Is confirmed = " + isConfirmed);console.log("ControlToken = " + controlTokenIndex);return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[controlTokenIndex], controlTokenURIs[controlTokenIndex], minValues[controlTokenIndex], maxValues[controlTokenIndex], startValues[controlTokenIndex]).then(function(tx) {controlTokenIndex++;return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {console.log("Is confirmed = " + isConfirmed);console.log("ControlToken = " + controlTokenIndex);return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[controlTokenIndex], controlTokenURIs[controlTokenIndex], minValues[controlTokenIndex], maxValues[controlTokenIndex], startValues[controlTokenIndex]).then(function(tx) {controlTokenIndex++;return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {console.log("Is confirmed = " + isConfirmed);console.log("ControlToken = " + controlTokenIndex);return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[controlTokenIndex], controlTokenURIs[controlTokenIndex], minValues[controlTokenIndex], maxValues[controlTokenIndex], startValues[controlTokenIndex]).then(function(tx) {controlTokenIndex++;return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {console.log("Is confirmed = " + isConfirmed);console.log("ControlToken = " + controlTokenIndex);return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[controlTokenIndex], controlTokenURIs[controlTokenIndex], minValues[controlTokenIndex], maxValues[controlTokenIndex], startValues[controlTokenIndex]).then(function(tx) {controlTokenIndex++;return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {console.log("Is confirmed = " + isConfirmed);console.log("ControlToken = " + controlTokenIndex);return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[controlTokenIndex], controlTokenURIs[controlTokenIndex], minValues[controlTokenIndex], maxValues[controlTokenIndex], startValues[controlTokenIndex]).then(function(tx) {controlTokenIndex++;return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {console.log("Is confirmed = " + isConfirmed);console.log("ControlToken = " + controlTokenIndex);return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[controlTokenIndex], controlTokenURIs[controlTokenIndex], minValues[controlTokenIndex], maxValues[controlTokenIndex], startValues[controlTokenIndex]).then(function(tx) {controlTokenIndex++;return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {console.log("Is confirmed = " + isConfirmed);console.log("ControlToken = " + controlTokenIndex);return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[controlTokenIndex], controlTokenURIs[controlTokenIndex], minValues[controlTokenIndex], maxValues[controlTokenIndex], startValues[controlTokenIndex]).then(function(tx) {controlTokenIndex++;return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {console.log("Is confirmed = " + isConfirmed);console.log("ControlToken = " + controlTokenIndex);return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[controlTokenIndex], controlTokenURIs[controlTokenIndex], minValues[controlTokenIndex], maxValues[controlTokenIndex], startValues[controlTokenIndex]).then(function(tx) {controlTokenIndex++;return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {console.log("Is confirmed = " + isConfirmed);console.log("ControlToken = " + controlTokenIndex);return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[controlTokenIndex], controlTokenURIs[controlTokenIndex], minValues[controlTokenIndex], maxValues[controlTokenIndex], startValues[controlTokenIndex]).then(function(tx) {controlTokenIndex++;return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {console.log("Is confirmed = " + isConfirmed);console.log("ControlToken = " + controlTokenIndex);return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[controlTokenIndex], controlTokenURIs[controlTokenIndex], minValues[controlTokenIndex], maxValues[controlTokenIndex], startValues[controlTokenIndex]).then(function(tx) {controlTokenIndex++;return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {console.log("Is confirmed = " + isConfirmed);console.log("ControlToken = " + controlTokenIndex);return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[controlTokenIndex], controlTokenURIs[controlTokenIndex], minValues[controlTokenIndex], maxValues[controlTokenIndex], startValues[controlTokenIndex]).then(function(tx) {controlTokenIndex++;return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {console.log("Is confirmed = " + isConfirmed);console.log("ControlToken = " + controlTokenIndex);return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[controlTokenIndex], controlTokenURIs[controlTokenIndex], minValues[controlTokenIndex], maxValues[controlTokenIndex], startValues[controlTokenIndex]).then(function(tx) {controlTokenIndex++;return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {console.log("Is confirmed = " + isConfirmed);})})})})})})})})})})})})})})})})})})})})})})})})})})})})})})})})})})})})})})})})})})})})})})})})})})})})})})})})})})})})})})})})
			// 	return artworkInstance.getControlToken(1, 0).then(function(lever) {
			// 		console.log(lever);
			// 	});				
	    		 



	  //  //  		return artworkInstance.totalSupply().then(function(supply) {
			// 	// 	console.log(supply.toString() + " total tokens")

			// 	// 	// the artwork token should be confirmed since all the control artists are the same as the POV artist
			// 	// 	return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {
			// 	// 		assert.isFalse(isConfirmed);	

			// 	// 		return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[0], controlTokenURIs[0],
			// 	// 			minValues[0], maxValues[0], startValues[0]).then(function(tx) {
			// 	// 			// console.log(tx)
			// 	// 			return artworkInstance.getControlLever(1, 0).then(function(lever) {
			// 	// 				console.log(lever[2].toString());
			// 	// 			});		

			// 	// 		// 	return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {
			// 	// 		// 		assert.isFalse(isConfirmed);
								
			// 	// 		// 		return artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[1], controlTokenURIs[1],
			// 	// 		// 			minValues[1], maxValues[1], startValues[1]).then(function(tx) {							

			// 	// 		// 			return artworkInstance.isContainingArtworkConfirmed(expectedArtworkTokenId).then(function(isConfirmed) {
			// 	// 		// 				// assert.isTrue(isConfirmed);

			// 	// 		// 				return artworkInstance.getControlLever(1, 0).then(function(controlLever) {
			// 	// 		// 					console.log(controlLever.toString());
			// 	// 		// 				});
			// 	// 		// 			});
			// 	// 		// 		});
			// 	// 		// 	});
			// 	// 		});
			// 	// 	});
			// 	// });
			// });
		// });
	});


	it ("Reverts a bid from Artist A", async function() {		
		const BID_AMOUNT_ETHER = 0.1;

		const TOKEN_ID = 1;

		await truffleAssert.reverts(artworkInstance.bid(TOKEN_ID, {
				value: web3.utils.toWei(BID_AMOUNT_ETHER.toString(), 'ether'),
		}));
	});

	it ("Submits a bid from collector A", async function() {		
		const TOKEN_ID = 1;

		const BID_AMOUNT_ETHER = 0.1;

		await artworkInstance.bid(TOKEN_ID, {
			value: web3.utils.toWei(BID_AMOUNT_ETHER.toString(), 'ether'),
			from : COLLECTOR_A
		});

		// asser that pending bid has correct bidder and amount
		var pendingBid = await artworkInstance.pendingBids(TOKEN_ID)
		assert.equal(pendingBid.bidder, COLLECTOR_A);
		assert.equal(web3.utils.fromWei(pendingBid.amount.toString(), 'ether'), BID_AMOUNT_ETHER);
	});

	it ("Reverts a bid from Collector B that's too low", async function() {		
		const TOKEN_ID = 1;

		const BID_AMOUNT_ETHER = 0.05;

		await truffleAssert.reverts(artworkInstance.bid(TOKEN_ID, {
			value: web3.utils.toWei(BID_AMOUNT_ETHER.toString(), 'ether'),
			from : COLLECTOR_B
		}));
	});

	it ("Reverts a bid from Collector B that's equal", async function() {		
		const TOKEN_ID = 1;

		const BID_AMOUNT_ETHER = 0.1;

		// should still fail
		await truffleAssert.reverts(artworkInstance.bid(TOKEN_ID, {
			value: web3.utils.toWei(BID_AMOUNT_ETHER.toString(), 'ether'),
			from : COLLECTOR_B
		}));
	});

	it ("Collector A submits a higher bid", async function() {		
		const TOKEN_ID = 1;

		const PREVIOUS_BID_AMOUNT = 0.1;
		const BID_AMOUNT_ETHER = 0.15;

		var collectorBalanceBefore = await web3.eth.getBalance(COLLECTOR_A);

		var tx = await artworkInstance.bid(TOKEN_ID, {
			value: web3.utils.toWei(BID_AMOUNT_ETHER.toString(), 'ether'),
			from : COLLECTOR_A
		});

		var fulltx = await web3.eth.getTransaction(tx.tx);
		var gasPriceInEther = web3.utils.fromWei(fulltx.gasPrice, 'ether')
		var gasUsedInEther = tx.receipt.gasUsed * gasPriceInEther;

		var collectorBalanceAfter = await web3.eth.getBalance(COLLECTOR_A);

		// since the collector gets the previous bid back, their difference should be the new bid minus the previous bid plus the gas used
		var collectorBalanceDifference = web3.utils.fromWei((collectorBalanceBefore - collectorBalanceAfter).toString(), 'ether');
		var expectedAmountSpent = BID_AMOUNT_ETHER - PREVIOUS_BID_AMOUNT + gasUsedInEther;
		assert.equal(parseFloat(collectorBalanceDifference).toFixed(8), parseFloat(expectedAmountSpent).toFixed(8));
		
		// check that the new pending bid reflects the bid amount
		var pendingBid = await artworkInstance.pendingBids(TOKEN_ID)
		assert.equal(pendingBid.bidder, COLLECTOR_A);
		assert.equal(web3.utils.fromWei(pendingBid.amount.toString(), 'ether'), BID_AMOUNT_ETHER);
	});

	it ("tests a higher bid from Collector B (returning collector A's previous bid)", async function() {
		const TOKEN_ID = 1;

		const PREVIOUS_BID_AMOUNT = 0.15;
		const BID_AMOUNT_ETHER = 0.16;

		var collectorABalanceBefore = await web3.eth.getBalance(COLLECTOR_A);

		var tx = await artworkInstance.bid(TOKEN_ID, {
			value: web3.utils.toWei(BID_AMOUNT_ETHER.toString(), 'ether'),
			from : COLLECTOR_B
		});

		var collectorABalanceAfter = await web3.eth.getBalance(COLLECTOR_A);

		// since collectorA gets their previous bid back, their difference should be increased by the amount of the previous bid
		var collectorABalanceDifference = web3.utils.fromWei((collectorABalanceAfter - collectorABalanceBefore).toString(), 'ether');
		assert.equal(collectorABalanceDifference, PREVIOUS_BID_AMOUNT);
		
		// check that the new pending bid reflects the bid amount
		var pendingBid = await artworkInstance.pendingBids(TOKEN_ID)
		assert.equal(pendingBid.bidder, COLLECTOR_B);
		assert.equal(web3.utils.fromWei(pendingBid.amount.toString(), 'ether'), BID_AMOUNT_ETHER);
	});

	it ("tests transferring platform ownership to a new owner", async function() {
		assert.equal(await artworkInstance.platformAddress(), ARTIST_A);

		await artworkInstance.updatePlatformAddress(NEW_PLATFORM_ADDRESS);

		assert.equal(await artworkInstance.platformAddress(), NEW_PLATFORM_ADDRESS);
	});

	it ("attempts to accept bid when not the owner", async function() {	
		const TOKEN_ID = 1;

		await truffleAssert.reverts(artworkInstance.acceptBid(TOKEN_ID, {
			from: ARTIST_B
		}));
	});

	it ("attempts to accept bid for non-existent token", async function() {	
		const TOKEN_ID = 100;

		await truffleAssert.reverts(artworkInstance.acceptBid(TOKEN_ID));
	});

	it ("Artist A accepts a current high bid from Collector B", async function() {	
		const TOKEN_ID = 1;
		
		// get the pending bid amount
		var pendingBidAmount = (await artworkInstance.pendingBids(TOKEN_ID)).amount;
		// get the platform's balance before 
		var platformBalanceBefore = await web3.eth.getBalance(NEW_PLATFORM_ADDRESS);
		// assert ownership
		assert.isFalse(await artworkInstance.tokenDidHaveFirstSale(TOKEN_ID));
		assert.equal(await artworkInstance.ownerOf(TOKEN_ID), ARTIST_A)
		// accept the bid
		var tx = await artworkInstance.acceptBid(TOKEN_ID);
		// assert transfer worked
		assert.isTrue(await artworkInstance.tokenDidHaveFirstSale(TOKEN_ID));
		assert.equal(await artworkInstance.ownerOf(TOKEN_ID), COLLECTOR_B)

		// calculate the difference in platform's balance
		var platformBalanceAfter = await web3.eth.getBalance(NEW_PLATFORM_ADDRESS);
		var platformBalanceDifference = platformBalanceAfter - platformBalanceBefore;

		// calculate the expected royalty
		var platformFirstSalePercentage = await artworkInstance.platformFirstSalePercentage();
		var platformExpectedRoyalty = (platformFirstSalePercentage / 100) * pendingBidAmount;
		// assert difference is equal to expected royalty
		assert.equal(platformBalanceDifference, platformExpectedRoyalty);
		
		// TODO Artist A, B, C should all have equally split the sale amount (minus royalty)
	});
	// TODO test artist accepting bid on base token (check that royalty is split amongst unique token creators and platform)
	// TODO test Collector C bidding on base token
	// TODO test Collector B accepting. (royalty should be split but lower %).

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