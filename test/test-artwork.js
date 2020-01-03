const AsyncArtwork = artifacts.require("./AsyncArtwork.sol");

// async function DeployArtwork(deployer, artworkTokenURI, title, symbol, controlTokenURIEndIndices, 
//   controlTokenURIs, numLeversPerControlToken, leverIds, minValues, maxValues, startValues) {

//   await deployer.deploy(AsyncArtwork, "\"" + title + "\"", symbol)

//   var artInstance = await AsyncArtwork.deployed();

//   await artInstance.mintArtwork(OWNER_ADDRESS, artworkTokenURI, controlTokenURIs, controlTokenURIEndIndices, numLeversPerControlToken, 
//     leverIds, minValues, maxValues, startValues);

//   console.log("Platform First " + (await artInstance.platformFirstSaleRoyaltyPercentage()) + "%")
//   console.log("Platform Secondary " + (await artInstance.platformSecondaryRoyaltyPercentage()) + "%")
//   console.log("Artist Secondary " + (await artInstance.artistSecondaryRoyaltyPercentage()) + "%")

//   console.log(await artInstance.name())
//   console.log(await artInstance.symbol())
  
//   console.log("balance of owner: " + (await artInstance.balanceOf(OWNER_ADDRESS)).toString())

//   console.log("artwork URI: " + (await artInstance.tokenURI(0)));

//   console.log("Artwork Token: " + 0 + " has: "+ (await artInstance.numControlTokensMapping(0)).toString() + " control token(s)");

//   for (var i = 0; i < controlTokenURIEndIndices.length; i++) {    
//     console.log("Control Token: " + (i + 1));

//     console.log("    Token URI: " + (await artInstance.tokenURI((i + 1))));
    
//     console.log("    MinMax: " + (await artInstance.getControlLeverMinMax(i + 1, 0)));

//     console.log("    Current Value: " + (await artInstance.getControlLeverValue(i + 1, 0)));
//   }

//   return artInstance;
// }

contract("AsyncArtwork", function(accounts) {
	var artworkInstance;

	const OWNER_ADDRESS = "0xD68f4893e2683BE6EfE6Aab3fca65848ACAFcC05"
	var title = "Hubris";
  	var symbol = "ASYNC-HUBRIS";
  	var artworkURI = "Qmdje2aCRquFe15oFD88jyoNrbTFUUc74xQqQMssqcZwHa";	
  	var controlTokenURIs = ["QmXrJCW3exLXe2iCCCeVSTais4rTW8FZgisZTHAxVLVXvC", "ZmXrJCW3exLXe2iCCCeVSTais4rTW8FZgisZTHAxVLVXvC"];

	// generate the end indices
	var controlTokenURIEndIndex = 0;
	var controlTokenURIEndIndices = []; 
	for (var i = 0; i < controlTokenURIs.length; i++) {
	  controlTokenURIEndIndex += controlTokenURIs[i].length;    
	  controlTokenURIEndIndices.push(controlTokenURIEndIndex)    
	}

	var numLeversPerControlToken = [1, 1];
	var leverIds = [0, 0];
	var minValues = [0, 0];
	var maxValues = [1, 2];
	var startValues = [0, 0];  	

	it ("initializes contract", function() {
		return AsyncArtwork.deployed().then(function(instance) {
	  		artworkInstance = instance;
		});
	});

	it ("mints artwork", function() {
		return artworkInstance.mintArtwork(OWNER_ADDRESS, artworkURI, controlTokenURIs.join(""), controlTokenURIEndIndices, numLeversPerControlToken, 
    		leverIds, minValues, maxValues, startValues).then(function(tx) {
    		
    		return artworkInstance.name().then(function(artworkName) {
    			assert.equal(artworkName, title);

    			// return artworkInstance.totalSupply().then(function(supply) {
    			// });
    		});
		});
	});
});


// const MyERC721 = artifacts.require("./MyERC721.sol");

// contract("Scribe", function(accounts) {
//   var scribeInstance;
//   var myERC721Instance;
//   var documentKey;

//   var tokenOwnerAddress = "0xD68f4893e2683BE6EfE6Aab3fca65848ACAFcC05"

//   var dictationMessage = "This is a message"

//   it("initializes contracts", function() {
//     return Scribe.deployed().then(function(instance) {
//       scribeInstance = instance;

//       return MyERC721.deployed();
//       // return scribeInstance.getDocumentKey(tokenAddress, tokenId)
//     }).then(function(instance) {
//     	myERC721Instance = instance;


// 		// documentKey = _documentKey;

//       	// assert.equal(documentKey, "0xd68f4893e2683be6efe6aab3fca65848acafcc050000000000000000000000000000000000000000000000000000000000000001");
//     });
//   });

//   it("mints a sample ERC721 token and asserts that the token was minted and received", function() {
//     return myERC721Instance.mintUniqueTokenTo(tokenOwnerAddress, 3, "QmZuKRfpCWV8SWgFcvjUWWQtn47axMYmdrPafvzTmppTPv").then(function(tx) {
//     	return myERC721Instance.ownerOf(3);
//     }).then(function(owner) {    
//       assert.equal(owner, tokenOwnerAddress)
//     });
//   });

//   it("dictates a record for the scribe and that the message is expected", function() {
//     return scribeInstance.dictate(myERC721Instance.address, 3, dictationMessage).then(function(tx) {    	
//     	return scribeInstance.getDocumentKey(myERC721Instance.address, 3);
//     }).then(function(_documentKey) {    
//     	documentKey = _documentKey;

//     	return scribeInstance.documents(documentKey, 0);
//     }).then(function(document) {    
//     	console.log(document.dictator)
//     	console.log(document.text)
    	
//     	assert.equal(document.text, dictationMessage)
//     });
//   });

//   // it("records one message and asserts document count is still correct", function() {
//   //   return Scribe.deployed().then(function(instance) {
//   //     scribeInstance.dictate(tokenAddress, tokenId, "Foo")

//   //     return scribeInstance.documentsCount(documentKey)
//   //   }).then(function(documentsCount) {    
//   //     assert.equal(documentsCount, 3);
//   //   });
//   // });

//   // it("asserts that message from first recording is correct", function() {
//   //   return Scribe.deployed().then(function(instance) {
//   //     return scribeInstance.documents(documentKey, 0)
//   //   }).then(function(document) {    
//   //   	assert.equal(document.text, "Hello")
//   //   });
//   // });

//   // it("records message for new token and asserts that document count is correct", function() {
//   //   return Scribe.deployed().then(function(instance) {
// 		// tokenId = 2
      	
//   //     	scribeInstance.dictate(tokenAddress, tokenId, "Piano")

//   //     	return scribeInstance.getDocumentKey(tokenAddress, tokenId)
//   //   }).then(function(_documentKey) {    
//   //   	documentKey = _documentKey;
    	
//   //   	return scribeInstance.documentsCount(documentKey);
//   //   }).then(function(documentsCount) {
//   //   	assert.equal(documentsCount, 1)
//   //   })
//   // });
// });