const AsyncArtwork = artifacts.require("./AsyncArtwork.sol");

const OWNER_ADDRESS = "0xD68f4893e2683BE6EfE6Aab3fca65848ACAFcC05"

async function DeployArtwork(deployer, artworkTokenId, artworkTokenURI, title, symbol, controlTokenIds, controlTokenURIEndIndices, 
  controlTokenURIs, numLeversPerControlToken, leverIds, minValues, maxValues, startValues) {

  await deployer.deploy(AsyncArtwork, "\"" + title + "\"", symbol)

  var artInstance = await AsyncArtwork.deployed();

  console.log(await artInstance.name())
  console.log(await artInstance.symbol()) 

  // await artInstance.mintOwnerTokenTo(OWNER_ADDRESS, "Qmdje2aCRquFe15oFD88jyoNrbTFUUc74xQqQMssqcZwHa") 
  await artInstance.mintArtwork(OWNER_ADDRESS, artworkTokenId, artworkTokenURI,
    controlTokenIds, controlTokenURIEndIndices, controlTokenURIs, numLeversPerControlToken, 
    leverIds, minValues, maxValues, startValues);

  console.log((await artInstance.balanceOf(OWNER_ADDRESS)).toString())

  console.log(await artInstance.tokenURI(artworkTokenId));
  for (var i = 0; i < controlTokenIds.length; i++) {
    
    console.log("Control Token: " + controlTokenIds[i])

    console.log(await artInstance.tokenURI(controlTokenIds[i]));
  }  

  return artInstance;
}

module.exports = async function(deployer) {
  var title = "Hubris";
  var symbol = "ASYNC-HUBRIS";
  var controlTokenIds = [1, 2];
  
  var controlTokenURIEndIndices = [3, 7];
  var controlTokenURIs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; // ABCDEFGHIJ
  
  var numLeversPerControlToken = [1, 1];
  var leverIds = [0, 0];
  var minValues = [0, 0];
  var maxValues = [1, 2];
  var startValues = [0, 0];
  
  var artworkInstance = await DeployArtwork(deployer, 0, "Qmdje2aCRquFe15oFD88jyoNrbTFUUc74xQqQMssqcZwHa", 
      title, symbol, controlTokenIds, controlTokenURIEndIndices,
      controlTokenURIs, numLeversPerControlToken, leverIds, minValues, maxValues, startValues);

  console.log("Done")
  // await artworkInstance.mintControlTokenTo(OWNER_ADDRESS, CONTROL_TOKEN_ID, leverIds.length, "QmZ5QMF88zPKKLoe6t35itphECVE6cZTARmUzt69RrpGdr");
  // await artworkInstance.addControlTokenLevers(CONTROL_TOKEN_ID, leverIds, minValues, maxValues, startValues);

  // var controlToken = await artworkInstance.controlTokenMapping(CONTROL_TOKEN_ID)
  
  // // console.log(controlToken.numControlLevers.toString())
  // // console.log(controlToken.expectedNumControlLevers.toString())
  // // console.log(controlToken)
  // // console.log(controlToken.minValue.toString())
  // // // console.log(controlToken.maxValue.toString())

  // var controlLeverValue = await artworkInstance.getControlLeverValue(CONTROL_TOKEN_ID, 0);
  
  // console.log(controlLeverValue.toString())

  // controlLeverValue = await artworkInstance.getControlLeverValue(CONTROL_TOKEN_ID, 1);
  
  // console.log(controlLeverValue.toString())

  // // use the control token  
  // leverIds = [1, 0];
  // var newValues = [200, 75];
  
  // await artworkInstance.useControlToken(CONTROL_TOKEN_ID, leverIds, newValues);

  // controlLeverValue = await artworkInstance.getControlLeverValue(CONTROL_TOKEN_ID, 1);
  
  // console.log("after using control: " + controlLeverValue.toString())

  // controlLeverValue = await artworkInstance.getControlLeverValue(CONTROL_TOKEN_ID, 0);
  
  // console.log("after using control: " + controlLeverValue.toString())
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

