const Migrations = artifacts.require("./Migrations.sol");

const AsyncArtwork_v2 = artifacts.require("./AsyncArtwork_v2.sol");

const TokenUpgrader = artifacts.require("./TokenUpgrader.sol");

module.exports = async function(deployer) {
  await deployer.deploy(Migrations)

  var title = "Async Art";
  var symbol = "ASYNC";

  console.log("AsyncArtwork bytecode size: ", AsyncArtwork_v2.deployedBytecode.length);

  let v1_deployed = await deployer.deploy(AsyncArtwork_v2);

  let v2_deployed = await deployer.deploy(AsyncArtwork_v2);

  await deployer.deploy(TokenUpgrader, v1_deployed.address);
};
