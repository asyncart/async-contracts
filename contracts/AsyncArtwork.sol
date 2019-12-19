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
    event BidWithdrawn (
    	address bidder,
    	uint256 tokenId
    );

    // An event whenever a buy now price has been set
    event BuyPriceSet (
    	uint256 tokenId,
    	uint256 price
    );

    // An event when a token has been sold 
    event TokenSale (
    	// the address of the buyer
    	address buyer,
    	// the id of the token
    	uint256 tokenId,
    	// the price that the token was sold for
    	uint256 salePrice
    );

    // An event whenever a control token has been updated
    event ControlUpdated (
    	// the address of who updated this control
    	address updater,
    	// the id of the token
    	uint256 tokenId,
    	// the previous value that the token had before this update (for clients who want to animate the change)
    	int256 previousValue,
    	// the new updated value
    	int256 updatedValue
	);

	struct ControlToken {
		// The minimum value this token can have (inclusive)
		int256 minValue;
		// The maximum value this token can have (inclusive)
		int256 maxValue;
		// The current value for this token
		int256 currentValue;
	}

	// struct for a pending bid 
	struct PendingBid {
		// the address of the bidder
		address payable bidder;
		// the amount that they bid
		uint256 amount;
		// false by default, true once instantiated
		bool exists;
	}

	mapping (uint256 => ControlToken) public controlTokens;
	
	mapping (uint256 => uint256) public buyPrices;
	
	mapping (uint256 => PendingBid) public highestBids;
	mapping (uint256 => PendingBid) public secondHighestBids;


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
    	require(ownerOf(tokenId) != msg.sender, "Token owners can't bid on their own tokens.");

    	if (highestBids[tokenId].exists) {
    		require(msg.value > highestBids[tokenId].amount, "Bid must be higher than previous bid amount.");
    		
    		if (secondHighestBids[tokenId].exists) {
    			// return current second highest bidder amount back
    			secondHighestBids[tokenId].bidder.transfer(secondHighestBids[tokenId].amount);
    		}

    		// convert current highest bid to second highest bid
    		secondHighestBids[tokenId] = highestBids[tokenId];
    	}

    	// set the new highest bid
    	highestBids[tokenId] = PendingBid(msg.sender, msg.value, true);

    	// Emit event for the bid proposal
    	emit BidProposed(msg.sender, tokenId, msg.value);
    }

    // allows an address with a pending bid to withdraw it
    function withdrawBid(uint256 tokenId) public {
    	// Return bid amount back to owner
    	if ((highestBids[tokenId].exists) && (highestBids[tokenId].bidder == msg.sender)) {
    		// second highest bid now becomes the highest
			highestBids[tokenId] = secondHighestBids[tokenId];

			// If this was highest bid, then boost second highest bid up to first 	
			if (secondHighestBids[tokenId].exists) {
				// clear the second highest bid
				secondHighestBids[tokenId] = PendingBid(address(0), 0, false);
			}

    		// only emit an event when the highest bid is withdrawn
    		emit BidWithdrawn(msg.sender, tokenId);
    	} else if ((secondHighestBids[tokenId].exists) && (secondHighestBids[tokenId].bidder == msg.sender)) {
    		secondHighestBids[tokenId] = PendingBid(address(0), 0, false);
    	} else {
    		revert("No bid to withdraw.");
    	}
    }

    function takeBuyPrice(uint256 tokenId) public payable {
    	// TODO
    	// Return all bidder's money
    	// Transfer token
    	// Emit event
    }

    // Owner functions
    function acceptHighestBid(uint256 tokenId) public {
    	// check if sender is owner of token
    	require(ownerOf(tokenId) == msg.sender, "Only token owners can accept bids.");
    	// TODO
    	// Take highest bidder money    	
    	// Return rest of bidder's money
    	// reset buy price
    	// Transfer token
    	// Emit event
    }

    function makeBuyPrice(uint256 tokenId, uint256 amount) public {
    	// check if sender is owner of token
    	require(ownerOf(tokenId) == msg.sender, "Only token owners can set buy price.");
    	// set the buy price
    	buyPrices[tokenId] = amount;
    	// emit event
    	emit BuyPriceSet(tokenId, amount);
    }

    function useControlToken(uint256 tokenId, int256 newValue) public {
    	// check if sender is owner of token
    	require(ownerOf(tokenId) == msg.sender, "Control tokens only usuable by owners.");

    	// Enforce that the new value is valid
    	require((newValue >= controlTokens[tokenId].minValue) && (newValue <= controlTokens[tokenId].maxValue), "Invalid value.");

    	// Enforce that the new value is valid
    	require(newValue != controlTokens[tokenId].currentValue, "Must provide different value.");

    	// grab previous value for the event
    	int256 previousValue = controlTokens[tokenId].currentValue;

    	// Update token current value
    	controlTokens[tokenId] = ControlToken(controlTokens[tokenId].minValue, controlTokens[tokenId].maxValue, newValue);

    	// emit event
    	emit ControlUpdated(msg.sender, tokenId, previousValue, newValue);
    }
}