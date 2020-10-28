const Migrations = artifacts.require("./Migrations.sol");
const AsyncArtwork_v2 = artifacts.require("./AsyncArtwork_v2.sol");
const TokenUpgrader = artifacts.require("./TokenUpgrader.sol");
const { scripts, ConfigManager } = require("@openzeppelin/cli");
const { add, push, create } = scripts;

async function deploy(options, accounts, argsArray, networkName) {
  add({
    contractsData: [{ name: "AsyncArtwork_v2", alias: "AsyncArtwork_v2" }],
  });

  await push({ ...options, force: true });

  const asyncContract = await create({
    ...options,
    contractAlias: "AsyncArtwork_v2",
    methodName: "initialize",
    methodArgs: argsArray,
  });

  if (networkName == "graphTesting") {
    const asyncInstance = await AsyncArtwork_v2.at(asyncContract.address);

    // function whitelistTokenForCreator(address creator, uint256 masterTokenId, uint256 layerCount,
    //   uint256 platformFirstSalePercentage, uint256 platformSecondSalePercentage) external onlyPlatform {
    await asyncInstance.whitelistTokenForCreator(accounts[1], 1, 5, 10, 10, {
      from: accounts[0],
    });
  }
}

module.exports = function(deployer, networkName, accounts) {
  deployer.then(async () => {
    // Don't try to deploy/migrate the contracts for tests
    if (networkName === "test") {
      return;
    }
    let title = "Async Art";
    let symbol = "ASYNC";

    // function initialize(string memory name, string memory symbol, uint256 initialExpectedTokenSupply, address _upgraderAddress) public initializer {
    let argsArray = [title, symbol, 1, accounts[0]];

    const { network, txParams } = await ConfigManager.initNetworkConfiguration({
      network: networkName,
      from: accounts[0],
    });
    await deploy({ network, txParams }, accounts, argsArray, networkName);
  });
};
