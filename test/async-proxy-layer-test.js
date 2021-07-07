const {
  BN,
  expectRevert,
  ether,
  expectEvent,
  balance,
  time,
} = require("@openzeppelin/test-helpers");
const {
  artifacts
} = require("hardhat");
const {
  expect
} = require("chai");

const AsyncArtwork_v2 = artifacts.require("AsyncArtwork_v2");
const ProxyLayer = artifacts.require("ProxyLayer");
const NFT = artifacts.require("TestERC721");

contract("Async art", (accounts) => {
  let asyncContract;
  let proxyLayer;
  let nft1;
  let nft2;

  const admin = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];

  let title = "Async Art";
  let symbol = "ASYNC";

  beforeEach(async () => {
    asyncContract = await AsyncArtwork_v2.new({
      from: admin
    });

    await asyncContract.setup(title, symbol, 1, admin, {
      from: admin,
    });

    proxyLayer = await ProxyLayer.new(asyncContract.address, {
      from: admin
    });

    nft1 = await NFT.new({
      from: admin
    });
    await nft1.initialize({
      from: admin,
    });

    nft2 = await NFT.new({
      from: admin
    });

    await nft2.initialize({
      from: admin,
    });
  });

  it("successfully initialises", async () => {
    console.log("hello");
    //////////////////////////////////
    /////////////// NAMES ////////////
    //////////////////////////////////

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

    await asyncContract.updateMinterAddress(admin, {
      from: admin
    });
    // params: creator, mastertokenId, layerCount, platformFirstSalePercentage, platformSecondSalePercentage
    await asyncContract.whitelistTokenForCreator(
      user1,
      masterToken1,
      5,
      15,
      10, {
        from: admin,
      }
    );

    await asyncContract.whitelistTokenForCreator(
      user2,
      masterToken7,
      3,
      12,
      8, {
        from: admin,
      }
    );

    // 30 aritsts
    await asyncContract.whitelistTokenForCreator(user2, 11, 30, 12, 8, {
      from: admin,
    });

    // 30 artists
    await asyncContract.whitelistTokenForCreator(user2, 42, 30, 12, 8, {
      from: admin,
    });

    //////////////////////////////////
    ////////// Minting tokens ////////
    //////////////////////////////////

    console.log("Minting tokens");

    let userArray = [
      user2,
      user3,
      user3,
      user4,
      user5,
      user5,
      user5,
      user6,
      user8,
      user9,
      user2,
      user3,
      user3,
      user4,
      user5,
      user5,
      user5,
      user6,
      user8,
      user9,
      user2,
      user3,
      user3,
      user4,
      user5,
      user5,
      user5,
      user6,
      user8,
      user9,
    ];

    // User 1 mints his artwork
    await asyncContract.mintArtwork(
      masterToken1,
      "DATA",
      [user3, user3, user3, user3, user4],
      [user3, user4], {
        from: user1
      }
    );

    // User 2 mints his artwork
    await asyncContract.mintArtwork(
      masterToken7,
      "RANDOMDATA",
      [user2, user3, user3],
      [user2, user3], {
        from: user2,
      }
    );

    await asyncContract.mintArtwork(
      11,
      "RANDOMDATA",
      userArray,
      [user2, user3, user4, user5, user6, user8, user9], {
        from: user2,
      }
    );

    await asyncContract.mintArtwork(
      42,
      "RANDOMDATA",
      userArray,
      [user2, user3, user4, user5, user6, user8, user9], {
        from: user2,
      }
    );

    // await asyncContract.mintArtworkOptimised2(
    //   42,
    //   "RANDOMDATA",
    //   userArray,
    //   [user2, user3, user4, user5, user6, user8, user9],
    //   {
    //     from: user2,
    //   }
    // );

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
      [masterToken1, token2, token3], {
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
      30,
      [user8], {
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
      [], {
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

    await asyncContract.takeBuyPrice(token2, 30, {
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

    ///////////////////////////////////////////////
    ////////////// Proxy Layers ///////////////////
    ///////////////////////////////////////////////

    console.log("Minting demo NFTs");

    await nft1.mint(user7, 9999, {
      from: admin
    });
    await nft2.mint(user4, 1337, {
      from: admin
    });

    console.log("Converting to proxy layers");

    await asyncContract.useControlToken(token2, [0, 1, 2], [5, 5, 5], {
      from: user6,
    });

    await asyncContract.grantControlPermission(token2, user7, {
      from: user6,
    });

    await expectRevert(proxyLayer.permanentlyConvertToProxyLayer(masterToken1, nft2.address, 1337, {
      from: user6,
    }), "Token does not exist.");

    await expectRevert(proxyLayer.permanentlyConvertToProxyLayer(token2, nft1.address, 9999, {
      from: user4,
    }), "Only owner of the control token.");

    await expectRevert(proxyLayer.permanentlyConvertToProxyLayer(token2, nft1.address, 9999, {
      from: user6,
    }), "ERC721: transfer caller is not owner nor approved");

    await asyncContract.approve(proxyLayer.address, token2, {
      from: user6
    })

    expect(await asyncContract.ownerOf(token2)).to.equal(user6)

    await expectRevert(proxyLayer.permanentlyConvertToProxyLayer(token2, "0x0000000000000000000000000000000000000001", 9999, {
      from: user6,
    }), "function call to a non-contract account");

    await expectRevert(proxyLayer.permanentlyConvertToProxyLayer(token2, nft1.address, 666, {
      from: user6,
    }), "ERC721: owner query for nonexistent token");

    await proxyLayer.permanentlyConvertToProxyLayer(token2, nft1.address, 9999, {
      from: user6,
    });

    expect(await asyncContract.ownerOf(token2)).to.equal(proxyLayer.address)

    await expectRevert(asyncContract.useControlToken(token2, [0, 1, 2], [6, 6, 6], {
      from: user6,
    }), "Owner or permissioned only");

    await expectRevert(proxyLayer.useProxyLayer(token2, [0, 1, 2], [6, 6, 6], {
      from: user6,
    }), "Only the NFT owner or an approved address can use the proxy layer.");

    await proxyLayer.useProxyLayer(token2, [0, 1, 2], [6, 6, 6], {
      from: user7,
    });

    await nft1.transferFrom(user7, user6, 9999, {
      from: user7
    });

    await expectRevert(proxyLayer.useProxyLayer(token2, [0, 1, 2], [6, 6, 6], {
      from: user7,
    }), "Only the NFT owner or an approved address can use the proxy layer.");

    await proxyLayer.useProxyLayer(token2, [0, 1, 2], [5, 5, 5], {
      from: user6,
    });

    await expectRevert(proxyLayer.useProxyLayer(token2, [0, 1, 2], [5, 5, 5], {
      from: user7,
    }), "Only the NFT owner or an approved address can use the proxy layer.");

    await nft1.approve(user7, 9999, {
      from: user6
    });

    await proxyLayer.useProxyLayer(token2, [0, 1, 2], [4, 4, 4], {
      from: user7,
    });

    await expectRevert(proxyLayer.useProxyLayer(token2, [0, 1, 2], [5, 5, 5], {
      from: user8,
    }), "Only the NFT owner or an approved address can use the proxy layer.");

    await nft1.setApprovalForAll(user8, true, {
      from: user6
    });

    await proxyLayer.useProxyLayer(token2, [0, 1, 2], [5, 5, 5], {
      from: user8,
    });

  });
});