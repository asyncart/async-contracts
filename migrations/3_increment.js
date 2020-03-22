const Counter = artifacts.require("Counter");

module.exports = async function(deployer) {
    const counter = await Counter.deployed();
    await counter.increase(10);
};