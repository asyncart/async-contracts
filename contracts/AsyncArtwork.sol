pragma solidity ^0.5.12;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721Mintable.sol";

contract AsyncArtwork is ERC721Full {
	// An event whenever a bid is proposed  	
	event BidProposed (		
		address bidder,
		uint256 tokenId,
        uint256 bidAmount
    );

	// An event whenever an bid is withdrawn
    event bidWithdrawn (
    	address bidder,
    	uint256 tokenId
    );

	struct ControlToken {
		// The minimum value this token can have (inclusive)
		int256 minValue;
		// The maximum value this token can have (inclusive)
		int256 maxValue;
		// The current value for this token
		int256 currentValue;
	}

	mapping (uint256 => ControlToken) public controlTokens;

	uint256 private _maxControlTokenCount;

	uint256 public controlTokenCount;

	uint256 public constant OWNER_TOKEN_ID = 1;

	constructor (string memory name, string memory symbol, uint256 maxControlTokenCount) public 
  		ERC721Full(name, symbol) {	

  		_maxControlTokenCount = maxControlTokenCount;
  	}
  	
    function mintOwnerTokenTo(
        address to,
        string memory tokenURI
    ) public
    {
        super._mint(to, OWNER_TOKEN_ID);
        super._setTokenURI(OWNER_TOKEN_ID, tokenURI);
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
    	// TODO enforce that owner token has been minted already
       	
       	// TODO enforce that maxValue is greater than or equal to minValue
       	// TODO enforce that currentValue is valid

    	require(controlTokenCount < _maxControlTokenCount, "Max number of control tokens minted.");

    	// enforce that tokenId isn't the control token id
    	require(tokenId != OWNER_TOKEN_ID, "Token ID reserved for owner token id.");

        super._mint(to, tokenId);
        super._setTokenURI(tokenId, tokenURI);

        controlTokens[tokenId] = ControlToken(minValue, maxValue, currentValue);

        controlTokenCount++;
    }

    // Bidder functions
    function bid(uint256 tokenId) public payable {
    	// TODO
    	// Check that bid amount is higher than highest bid
    	// Return the previous bidder's money (except second highest)
    	// Hold bid amount in escrow
    	// Emit event
    }

    function withdrawBid(uint256 tokenId) public {
    	// TODO
    	// Return bid amount back to owner
    	// Emit event
    }

    function takeBuyNowPrice(uint256 tokenId) public payable {
    	// TODO
    	// Return all bidder's money
    	// Transfer token
    	// Emit event
    }

    // Owner functions
    function acceptHighestBid(uint256 tokenId) public {
    	// TODO
    	// Take highest bidder money    	
    	// Return rest of bidder's money
    	// Transfer token
    	// Emit event
    }

    function makeBuyNowPrice(uint256 tokenId, uint256 amount) public {
    	// TODO
    	// Transfer token
    }
}