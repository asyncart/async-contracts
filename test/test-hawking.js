const AsyncArtwork = artifacts.require("./AsyncArtwork.sol");

contract("AsyncArtwork", function(accounts) {
	var artworkInstance;

	const POV_ADDRESS = "0xD68f4893e2683BE6EfE6Aab3fca65848ACAFcC05"

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

	it ("mints Hawking Artwork", function() {
	  	var artworkURI = "Qmdje2aCRquFe15oFD88jyoNrbTFUUc74xQqQMssqcZwHa";	
	  	var controlTokenURIs = ["001.png", "002.png"];

		// generate the end indices
		var controlTokenURIEndIndex = 0;
		var controlTokenURIEndIndices = []; 
		for (var i = 0; i < controlTokenURIs.length; i++) {
		  controlTokenURIEndIndex += controlTokenURIs[i].length;    
		  controlTokenURIEndIndices.push(controlTokenURIEndIndex)    
		}

		var numLeversPerControlToken = [5, 5];
		// X, Y, Rotation, Scale X, Scale Y
		var leverIds = [0, 1, 2, 3, 4, 0, 1, 2, 3, 4];
		var minValues = [0, 0, 0, 100, 100, 0, 0, 0, 100, 100];
		var maxValues = [2048, 2048, 359, 200, 200, 2048, 2048, 359, 200, 200];
		var startValues = [1024, 1024, 0, 100, 100, 1024, 1024, 0, 100, 100];  

		return artworkInstance.mintArtwork(TEST_OWNER_ADDRESS, artworkURI, controlTokenURIs.join(""), controlTokenURIEndIndices, numLeversPerControlToken, 
    		leverIds, minValues, maxValues, startValues).then(function(tx) {
    		
    		return artworkInstance.totalSupply().then(function(supply) {
				console.log(supply.toString() + " total tokens")
			});
		});
	});

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