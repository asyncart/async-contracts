pragma solidity >=0.4.21 <0.6.0;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721Mintable.sol";

contract Artwork is ERC721Full, ERC721Mintable {
  // TODO
  // min value of token
  // max value of token
  // current value of token

  // current buy price for token
  // bids for token

  constructor (string memory _name, string memory _symbol) public 
  	ERC721Full(_name, _symbol) {	
  }
}