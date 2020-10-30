const Migrations = artifacts.require("./Migrations.sol");
const AsyncArtwork_v2 = artifacts.require("./AsyncArtwork_v2.sol");
const TokenUpgrader = artifacts.require("./TokenUpgrader.sol");

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

    const asyncContract = await deployer.deploy(AsyncArtwork_v2);
    await asyncContract.initialize(title, symbol, 1, accounts[0]);

    if (networkName == "graphTesting") {
      // function whitelistTokenForCreator(address creator, uint256 masterTokenId, uint256 layerCount,
      //   uint256 platformFirstSalePercentage, uint256 platformSecondSalePercentage) external onlyPlatform {
      await asyncContract.whitelistTokenForCreator(accounts[1], 1, 5, 10, 10, {
        from: accounts[0],
      });
      console.log("User whitelisted");
    }
  });
};
