const Migrations = artifacts.require("./Migrations.sol");
const AsyncArtwork_v2 = artifacts.require("./AsyncArtwork_v2.sol");
const TokenUpgrader = artifacts.require("./TokenUpgrader.sol");

module.exports = async function(deployer, accounts) {
  // await deployer.deploy(Migrations)

  var title = "Async Art";
  var symbol = "ASYNC";

  console.log(
    "AsyncArtwork bytecode size: ",
    AsyncArtwork_v2.deployedBytecode.length
  );

  await deployer.deploy(AsyncArtwork_v2);
  let v2_deployed = await AsyncArtwork_v2.deployed();

  // function initialize(string memory name, string memory symbol, uint256 initialExpectedTokenSupply, address _upgraderAddress) public initializer {
  await v2_deployed.initialize("test async", "TA", 1000, accounts[0]);

  //function whitelistTokenForCreator(address creator, uint256 masterTokenId, uint256 layerCount,
  await v2_deployed.whitelistTokenForCreator(accounts[1], 0, 5, {
    from: accounts[0],
  });

  // await deployer.deploy(TokenUpgrader, v1_deployed.address);
};
