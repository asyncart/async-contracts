pragma solidity ^0.5.0;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/ERC721Mintable.sol";

contract TestERC721 is ERC721Mintable {
    function initialize() public initializer {
        ERC721.initialize();
        ERC721Mintable.initialize(msg.sender);
    }
}
