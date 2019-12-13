pragma solidity >=0.4.21 <0.6.0;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721Mintable.sol";
// import "./ControlToken.sol";

contract AsyncArtwork is ERC721Full {
  // TODO
  // min value of token
  // max value of token
  // current value of token

  // current buy price for token
  // bids for token

	struct ControlToken {
		// The minimum value this token can have (inclusive)
		int256 minValue;
		// The maximum value this token can have (inclusive)
		int256 maxValue;
		// The current value for this token
		int256 currentValue;
	}

	mapping (uint256 => ControlToken) public controlTokens;

	uint256 private _numControlTokens;

	constructor (string memory name, string memory symbol, uint256 numControlTokens) public 
  		ERC721Full(name, symbol) {	

  		_numControlTokens = numControlTokens;
  	}
  	
    function mintOwnerTokenTo(
        address to,
        string memory tokenURI
    ) public
    {
    	uint256 tokenId = 1;

        super._mint(to, tokenId);
        super._setTokenURI(tokenId, tokenURI);
    }

    function mintControlTokenTo(
        address to,
        uint256 tokenId,
        int256 minValue,
        int256 maxValue,
        int256 currentValue,
        string memory tokenURI
    ) public
    {
        super._mint(to, tokenId);
        super._setTokenURI(tokenId, tokenURI);

       	// TODO enforce that owner token has been minted already
       	// TODO enforce that tokenId isn't the control token id
       	// TODO enforce that maxValue is greater than or equal to minValue
       	// TODO enforce that currentValue is valid
        controlTokens[tokenId] = ControlToken(minValue, maxValue, currentValue);
    }
}