const AsyncArtwork = artifacts.require("./AsyncArtwork.sol");

module.exports = async function(deployer) {
  await deployer.deploy(AsyncArtwork, "\"Bees of Tomorrow\"", "ASYNC-BEES", 1)

  let artworkInstance = await AsyncArtwork.deployed()

  console.log(await artworkInstance.name())
  console.log(await artworkInstance.symbol())  

  await artworkInstance.mintOwnerTokenTo("0xD68f4893e2683BE6EfE6Aab3fca65848ACAFcC05", "a")  

  var leverIds = [0, 1];
  var CONTROL_TOKEN_ID = 1;

  await artworkInstance.mintControlTokenTo("0xD68f4893e2683BE6EfE6Aab3fca65848ACAFcC05", CONTROL_TOKEN_ID, leverIds.length, "b")
  
  var minValues = [0, 0];
  var maxValues = [1000, 1000];
  var startValues = [250, 500];

  await artworkInstance.addControlTokenLevers(CONTROL_TOKEN_ID, leverIds, minValues, maxValues, startValues);

  // await artworkInstance.mintControlTokenTo("0x2c175DC859442E84914C6c7fFd3c06819c91bb55", 3, -10, 10, 5, "c")

  var controlToken = await artworkInstance.controlTokenMapping(CONTROL_TOKEN_ID)
  
  // console.log(controlToken.numControlLevers.toString())
  // console.log(controlToken.expectedNumControlLevers.toString())
  // console.log(controlToken)
  // console.log(controlToken.minValue.toString())
  // // console.log(controlToken.maxValue.toString())

  var controlLeverValue = await artworkInstance.getControlLeverValue(CONTROL_TOKEN_ID, 0);
  
  console.log(controlLeverValue.toString())
  // // // // use the control token
  // await artworkInstance.useControlToken(1, 0, 5);

  controlLeverValue = await artworkInstance.getControlLeverValue(CONTROL_TOKEN_ID, 1);
  
  console.log(controlLeverValue.toString())
};


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

