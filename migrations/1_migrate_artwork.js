const AsyncArtwork = artifacts.require("./AsyncArtwork.sol");

module.exports = async function(deployer) {
  var title = "Async Art";
  var symbol = "ASYNC";  

  console.log("AsyncArtwork bytecode size: ", AsyncArtwork.deployedBytecode.length);
  
  await deployer.deploy(AsyncArtwork, title, symbol)  
};