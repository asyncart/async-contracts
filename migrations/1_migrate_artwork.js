const Artwork = artifacts.require("./Artwork.sol");

module.exports = async function(deployer) {
  await deployer.deploy(Artwork, "\"Bees of Tomorrow\"", "ASYNC-BEES")

  let artworkInstance = await Artwork.deployed()

  console.log(await artworkInstance.name())
  console.log(await artworkInstance.symbol())  

  await artworkInstance.mint("0x2c175DC859442E84914C6c7fFd3c06819c91bb55", 0)

  console.log((await artworkInstance.balanceOf("0x2c175DC859442E84914C6c7fFd3c06819c91bb55")).toString())
};


// const Scribe = artifacts.require("./Scribe.sol");
// const MyERC721 = artifacts.require("./MyERC721.sol");

// module.exports = async function(deployer) {
//   await deployer.deploy(Scribe);
  
  // await deployer.deploy(MyERC721, "MyERC721 Token", "MyERC721")
  
  // let erc721Instance = await MyERC721.deployed()
    
  // await erc721Instance.mintUniqueTokenTo("0x2c175DC859442E84914C6c7fFd3c06819c91bb55", 0, "Test")
  
  // await erc721Instance.mintUniqueTokenTo("0xaa60e4BC5f613C3d51f6b7e6EF174B18a944fada", 1, "Test")

  // await erc721Instance.mintUniqueTokenTo("0xD68f4893e2683BE6EfE6Aab3fca65848ACAFcC05", 2, "World")

  // let scribeInstance = await Scribe.deployed()

  // await scribeInstance.dictate(erc721Instance.address, 0, "This is MY token")

  // var documentKey = await scribeInstance.getDocumentKey(erc721Instance.address, 0)  
  
  // await scribeInstance.dictate(erc721Instance.address, 0, "This is MY token #2")
// };


// Scribe.deployed().then(function(a) {s=a})

// MyERC721.deployed().then(function(a) {erc721=a})
// erc721.mintUniqueTokenTo("0xD68f4893e2683BE6EfE6Aab3fca65848ACAFcC05", 0, "hello")

// s.getDocumentKey("0xD68f4893e2683BE6EfE6Aab3fca65848ACAFcC05", 1)

// s.dictate("0xD68f4893e2683BE6EfE6Aab3fca65848ACAFcC05", 1, "test")
// s.documents("0xd68f4893e2683be6efe6aab3fca65848acafcc050000000000000000000000000000000000000000000000000000000000000001", 0)
// s.documentsCount("0xd68f4893e2683be6efe6aab3fca65848acafcc050000000000000000000000000000000000000000000000000000000000000001")


// s.dictate("0xD68f4893e2683BE6EfE6Aab3fca65848ACAFcC05", 1, "you suck")

