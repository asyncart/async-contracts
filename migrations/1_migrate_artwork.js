const Migrations = artifacts.require("./Migrations.sol");
const AsyncArtwork = artifacts.require("./AsyncArtwork.sol");

module.exports = async function(deployer) {
  await deployer.deploy(Migrations)

  var title = "Async Art";
  var symbol = "ASYNC";

  console.log("AsyncArtwork bytecode size: ", AsyncArtwork.deployedBytecode.length);

  await deployer.deploy(AsyncArtwork, title, symbol)
};
