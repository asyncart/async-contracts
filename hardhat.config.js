require("solidity-coverage");
require("hardhat-gas-reporter");
require("@nomiclabs/hardhat-truffle5");

// You have to export an object to set up your config
// This object can have the following optional entries:
// defaultNetwork, networks, solc, and paths.
// Go to https://buidler.dev/config/ to learn more
module.exports = {
  // This is a sample solc configuration that specifies which version of solc to use
  solidity: {
    version: "0.5.12",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  gasReporter: {
    // Disabled by default for faster running of tests
    enabled: true,
    currency: "USD",
    gasPrice: 80,
    coinmarketcap: "",
  },
};
