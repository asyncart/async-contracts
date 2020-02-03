const AsyncArtwork = artifacts.require("./AsyncArtwork.sol");

module.exports = async function(deployer) {
  var title = "AA_v4";
  var symbol = "AA_v4";  

  console.log("AsyncArtwork bytecode size: ", AsyncArtwork.deployedBytecode.length);
  
  await deployer.deploy(AsyncArtwork, title, symbol)  

  var artworkInstance = await AsyncArtwork.deployed();

  var expectedArtworkTokenId = 0;

  // const ARTIST_A = "0xD68f4893e2683BE6EfE6Aab3fca65848ACAFcC05";
  const ARTIST_A = "0x73263CA29Fd9ad63AFf43e491D29e24f3815e827";

  // MLIBTY
  var controlTokenArtists = [ARTIST_A, ARTIST_A, ARTIST_A, ARTIST_A, ARTIST_A, ARTIST_A, ARTIST_A, ARTIST_A, ARTIST_A, ARTIST_A, ARTIST_A, ARTIST_A, ARTIST_A]

  var minValues = [];
  // MLIBTY
  minValues.push([0, 0, 60]); // Layer 1 - city / BTC logo
  minValues.push([0, 0, 40]); // Layer 2 - Red A
  minValues.push([0, 0, 40]); // Layer 3 - Red B
  minValues.push([0, 0, 40]); // Layer 4 - Red C
  minValues.push([0, 0, 40]); // Layer 5 - Red D
  minValues.push([0, 0, 30]); // Layer 6 - Black Plant 1
  minValues.push([0, 0, 30]); // Layer 7 - Black Plant 2
  minValues.push([0, 0, 40]); // Layer 8 - Black Shapes 1
  minValues.push([0, 0, 40]); // Layer 9 - Black Shapes 2
  minValues.push([0, 0, 40]); // Layer 10 - Black Shapes 3
  minValues.push([0, 0, 40]); // Layer 11 - Black Shapes 4
  minValues.push([0, 80]); // Layer 12 - Red Stains
  minValues.push([0, 80]); // Layer 13 - Infinity Falls

  var maxValues = [];
  // MLIBTY
  maxValues.push([359, 2, 100]) // Layer 1 - city / BTC logo
  maxValues.push([359, 359, 80]); // Layer 2 - Red A
  maxValues.push([359, 359, 80]); // Layer 3 - Red B
  maxValues.push([359, 359, 80]); // Layer 4 - Red C
  maxValues.push([359, 359, 80]); // Layer 5 - Red D
  maxValues.push([359, 359, 60]); // Layer 6 - Black Plant 1
  maxValues.push([359, 359, 60]); // Layer 7 - Black Plant 2
  maxValues.push([359, 359, 70]); // Layer 8 - Black Shapes 1
  maxValues.push([359, 359, 60]); // Layer 9 - Black Shapes 2
  maxValues.push([359, 359, 60]); // Layer 10 - Black Shapes 3
  maxValues.push([359, 359, 60]); // Layer 11 - Black Shapes 4
  maxValues.push([359, 120]); // Layer 12 - Red Stains
  maxValues.push([359, 120]); // Layer 13 - Infinity Falls

  var startValues = [];
  // MLIBTY
  startValues.push([0, 0, 67]) // Layer 1 - city / BTC logo
  startValues.push([320, 250, 50]); // Layer 2 - Red A
  startValues.push([45, 0, 65]); // Layer 3 - Red B
  startValues.push([135, 20, 60]); // Layer 4 - Red C
  startValues.push([235, 0, 65]); // Layer 5 - Red D
  startValues.push([250, 45, 40]); // Layer 6 - Black Plant 1
  startValues.push([210, 0, 40]); // Layer 7 - Black Plant 2
  startValues.push([140, 0, 65]); // Layer 8 - Black Shapes 1
  startValues.push([310, 0, 45]); // Layer 9 - Black Shapes 2
  startValues.push([45, 0, 50]); // Layer 10 - Black Shapes 3
  startValues.push([235, 0, 50]); // Layer 11 - Black Shapes 4
  startValues.push([0, 100]); // Layer 12 - Red Stains
  startValues.push([0, 100]); // Layer 13 - Infinity Falls

  await mintArtwork(artworkInstance, controlTokenArtists, expectedArtworkTokenId, "bitcoin-makes-the-world-go-around/layout.json", 
    minValues, maxValues, startValues);  

  expectedArtworkTokenId = parseInt(await artworkInstance.totalSupply())

  // ALOTTA
  controlTokenArtists = [ARTIST_A, ARTIST_A, ARTIST_A, ARTIST_A];
  // ALOTTA
  minValues = [];
  minValues.push([0]); // Layer 1 - Window
  minValues.push([0]); // Layer 2 - Background
  minValues.push([0]); // Layer 3 - Head
  minValues.push([0]); // Layer 4 - Item
  // ALOTTA
  maxValues = [];
  maxValues.push([3]) // Layer 1 - Window
  maxValues.push([3]); // Layer 2 - Background
  maxValues.push([3]); // Layer 3 - Head
  maxValues.push([3]); // Layer 4 - Item
  // ALOTTA
  startValues = []
  startValues.push([0]) // Layer 1 - Window
  startValues.push([0]); // Layer 2 - Background
  startValues.push([0]); // Layer 3 - Head
  startValues.push([0]); // Layer 4 - Item

  await mintArtwork(artworkInstance, controlTokenArtists, expectedArtworkTokenId, "alotta/layout.json", 
    minValues, maxValues, startValues);
};

async function mintArtwork(artworkInstance, controlTokenArtists, expectedArtworkTokenId, tokenURI, minValues, maxValues, startValues) {
  console.log("Minting artwork: " + tokenURI);

  var controlTokenIds = [];
  var controlTokenURIs = [];

  for (var i = 0; i < controlTokenArtists.length; i++) {
    controlTokenIds.push(i + expectedArtworkTokenId + 1);

    controlTokenURIs.push((i+1) + "");
  }   

  await artworkInstance.mintArtwork(expectedArtworkTokenId, tokenURI, controlTokenArtists);

  for (var controlTokenIndex = 0; controlTokenIndex < minValues.length; controlTokenIndex++ ) {
    console.log("Minting control token " + controlTokenIds[controlTokenIndex]);

    await artworkInstance.setupControlToken(expectedArtworkTokenId, controlTokenIds[controlTokenIndex], 
          controlTokenURIs[controlTokenIndex], minValues[controlTokenIndex], maxValues[controlTokenIndex], 
          startValues[controlTokenIndex]);
  }
}


// const Scribe = artifacts.require("./Scribe.sol");
// const MyERC721 = artifacts.require("./MyERC721.sol");

// module.exports = async function(deployer) {
//   await deployer.deploy(Scribe);
  
  // await deployer.deploy(MyERC721, "MyERC721 Token", "MyERC721")
  
  // let erc721Instance = await MyERC721.deployed()
    
  // await erc721Instance.mintUniqueTokenTo("0x2c175DC859442E84914C6c7fFd3c06819c91bb55", 0, "Test")
  
  // await erc721Instance.mintUniqueTokenTo("0xaa60e4BC5f613C3d51f6b7e6EF174B18a944fada", 1, "Test")

  // await erc721Instance.mintUniqueTokenTo("0xD68f4893e2683BE6EfE6Aab3fca65848ACAFcC05", 2, "World")

  // let scribeInstance = await Scribe.deployed()

  // await scribeInstance.dictate(erc721Instance.address, 0, "This is MY token")

  // var documentKey = await scribeInstance.getDocumentKey(erc721Instance.address, 0)  
  
  // await scribeInstance.dictate(erc721Instance.address, 0, "This is MY token #2")
// };


// Scribe.deployed().then(function(a) {s=a})

// MyERC721.deployed().then(function(a) {erc721=a})
// erc721.mintUniqueTokenTo("0xD68f4893e2683BE6EfE6Aab3fca65848ACAFcC05", 0, "hello")

// s.getDocumentKey("0xD68f4893e2683BE6EfE6Aab3fca65848ACAFcC05", 1)

// s.dictate("0xD68f4893e2683BE6EfE6Aab3fca65848ACAFcC05", 1, "test")
// s.documents("0xd68f4893e2683be6efe6aab3fca65848acafcc050000000000000000000000000000000000000000000000000000000000000001", 0)
// s.documentsCount("0xd68f4893e2683be6efe6aab3fca65848acafcc050000000000000000000000000000000000000000000000000000000000000001")


// s.dictate("0xD68f4893e2683BE6EfE6Aab3fca65848ACAFcC05", 1, "you suck")

