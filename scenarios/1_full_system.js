const allContractFunctions = async (asyncContract, accounts) => {
  //////////////////////////////////
  /////////////// NAMES ////////////
  //////////////////////////////////

  let admin = accounts[0];
  let user1 = accounts[1];
  let user2 = accounts[2];
  let user3 = accounts[3];
  let user4 = accounts[4];
  let user5 = accounts[5];
  let user6 = accounts[6];
  let user7 = accounts[7];
  let user8 = accounts[8];
  let user9 = accounts[9];

  let masterToken1 = 1; // 1st Master token
  let token2 = 2;
  let token3 = 3;
  let token4 = 4;
  let token5 = 5;
  let token6 = 6;
  let masterToken7 = 7; // 2nd Master token
  let token8 = 8;
  let token9 = 9;
  let token10 = 10;

  //////////////////////////////////
  ////////// Whitelists ////////////
  //////////////////////////////////
  console.log("Whitelist new tokens");

  // params: creator, mastertokenId, layerCount, platformFirstSalePercentage, platformSecondSalePercentage
  await asyncContract.whitelistTokenForCreator(user1, masterToken1, 5, 15, 10, {
    from: admin,
  });

  await asyncContract.whitelistTokenForCreator(user2, masterToken7, 3, 12, 8, {
    from: admin,
  });

  //////////////////////////////////
  ////////// Minting tokens ////////
  //////////////////////////////////
  console.log("Minting tokens");

  // User 1 mints his artwork
  await asyncContract.mintArtwork(
    masterToken1,
    "DATA",
    [user3, user3, user3, user3, user4],
    { from: user1 }
  );

  // User 2 mints his artwork
  await asyncContract.mintArtwork(
    masterToken7,
    "RANDOMDATA",
    [user2, user3, user3],
    {
      from: user2,
    }
  );

  ///////////////////////////////////////////////
  ////////// Admin functions called /////////////
  ///////////////////////////////////////////////
  console.log("Calling admin functions");

  await asyncContract.setExpectedTokenSupply(11, {
    from: admin,
  });

  await asyncContract.updatePlatformAddress(user9, {
    from: admin,
  });

  await asyncContract.updatePlatformAddress(admin, {
    from: user9,
  });

  await asyncContract.waiveFirstSaleRequirement(
    [masterToken1, token2, token3],
    {
      from: admin,
    }
  );

  await asyncContract.waiveFirstSaleRequirement([token2, token3, token4], {
    from: admin,
  });

  await asyncContract.updatePlatformSalePercentage(masterToken1, 9, 7, {
    from: admin,
  });

  await asyncContract.updateMinimumBidIncreasePercent(2, {
    from: admin,
  });

  // await asyncContract.updateTokenURI(token2, "NEWRANDOM", {
  //   from: admin,
  // });

  // await asyncContract.lockTokenURI(token2, {
  //   from: admin,
  // });

  await asyncContract.updateArtistSecondSalePercentage(6, {
    from: admin,
  });

  /////////////////////////////////////////
  ///// Setting up control levers /////////
  /////////////////////////////////////////
  console.log("Control lever set up");

  await asyncContract.setupControlToken(
    token2,
    "randomURI",
    [0, 1, 2],
    [10, 11, 12],
    [5, 6, 7],
    3,
    [user8],
    {
      from: user3,
    }
  );

  await asyncContract.setupControlToken(
    token6,
    "randomURI2",
    [0, 0],
    [100, 100],
    [50, 51],
    10,
    [],
    {
      from: user4,
    }
  );

  //////////////////////////////////
  //// more grantControlPermission //////
  //////////////////////////////////
  console.log("Granting more control permissions");

  await asyncContract.grantControlPermission(masterToken1, user8, {
    from: user6,
  });

  /////////////////////////////
  ////////// Bids /////////////
  /////////////////////////////
  console.log("Making bids");

  await asyncContract.bid(masterToken1, {
    from: user5,
    value: "1000000000",
  });

  await asyncContract.bid(masterToken1, {
    from: user6,
    value: "2000000000",
  });

  await asyncContract.withdrawBid(masterToken1, {
    from: user6,
  });

  await asyncContract.bid(masterToken1, {
    from: user6,
    value: "2500000000",
  });

  await asyncContract.acceptBid(masterToken1, "2000000000", {
    from: user1,
  });

  /////////////////////////////
  ////////// Buys /////////////
  /////////////////////////////
  console.log("Making buys");

  await asyncContract.makeBuyPrice(token2, "3000000", {
    from: user3,
  });

  await asyncContract.makeBuyPrice(token2, "2000000", {
    from: user3,
  });

  await asyncContract.makeBuyPrice(token2, "1000000", {
    from: user3,
  });

  await asyncContract.takeBuyPrice(token2, 3, {
    from: user6,
    value: "1000000",
  });

  //////////////////////////////////
  //// grantControlPermission //////
  //////////////////////////////////
  console.log("Granting control permissions");

  await asyncContract.grantControlPermission(token9, user8, {
    from: user3,
  });

  await asyncContract.grantControlPermission(token10, user7, {
    from: user3,
  });

  // Should handel duplicates
  await asyncContract.grantControlPermission(token10, user7, {
    from: user3,
  });

  ///////////////////////////////////////////////
  ////////// Control tokens used ////////////////
  ///////////////////////////////////////////////
  console.log("Using control tokens");

  await asyncContract.useControlToken(token2, [0, 1, 2], [8, 8, 8], {
    from: user6,
  });

  await asyncContract.useControlToken(token2, [0, 2], [9, 9], {
    from: user6,
  });

  await asyncContract.useControlToken(token6, [0, 1], [21, 21], {
    from: user4,
  });
};

module.exports = {
  allContractFunctions,
};
