pragma solidity ^0.5.12;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol";

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
    event ControlLeverUpdated (
    	// the address of who updated this control
    	address updater,
    	// the id of the token
    	uint256 tokenId,
    	// the previous value that the token had before this update (for clients who want to animate the change)
    	int256 previousValue,
    	// the new updated value
    	int256 updatedValue
	);

    // struct for a token that controls part of the artwork
    struct ControlToken {
        // the levers that this control token can use
        mapping (uint256 => ControlLever) levers;
        // the expected number of levers this control token will have
        uint256 expectedNumControlLevers;        
        // number that tracks how many levers there are
        uint256 numControlLevers;        
    }

    struct ControlLever {
        // // The minimum value this token can have (inclusive)
        int256 minValue;
        // The maximum value this token can have (inclusive)
        int256 maxValue;
        // The current value for this token
        int256 currentValue;
        // false by default, true once instantiated
        bool exists;
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

    uint256 private constant OWNER_TOKEN_ID = 1;
	uint256 private _expectedNumControlTokens;

	uint256 public numControlTokens;

	constructor (string memory name, string memory symbol, uint256 expectedNumControlTokens) public 
  		ERC721Full(name, symbol) {	

  		_expectedNumControlTokens = expectedNumControlTokens;
  	}

  	// TODO view method to say when an artwork has minted all its tokens and is ready/finalized for use
  	
  	// Mint the token that represents ownership of the entire artwork
    function mintOwnerTokenTo(address to, string memory tokenURI) public {
        super._safeMint(to, OWNER_TOKEN_ID);
        super._setTokenURI(OWNER_TOKEN_ID, tokenURI);
    }

    // Mint a control token with certain limitations as to what it can control
    function mintControlTokenTo(
        address to,
        uint256 tokenId,    
        uint256 expectedNumControlLevers,    
        string memory tokenURI
    ) public {       	
       	// enforce that we haven't minted more than the number of allowed control tokens
    	require(numControlTokens < _expectedNumControlTokens, "Max number of control tokens minted.");
    	// enforce that tokenId isn't the control token id
    	require(tokenId != OWNER_TOKEN_ID, "Token ID reserved for owner token id.");

    	// mint the token
        super._safeMint(to, tokenId);
        // set the URI
        super._setTokenURI(tokenId, tokenURI);

        // create the control token
        controlTokens[tokenId] = ControlToken(expectedNumControlLevers, 0);
        // increase control token counter
        numControlTokens++;
    }

    // add a control lever to a control token
    function addControlTokenLever(uint256 tokenId, uint256 leverId, int256 minValue, int256 maxValue, int256 startValue) public {
        // enforce that maxValue is greater than or equal to minValue
        require (maxValue >= minValue, "Max value must be greater than or equal to min value.");
        // enforce that currentValue is valid
        require((startValue >= minValue) && (startValue <= maxValue), "Invalid start value.");
        // TODO require msg.sender is one of the initial artists
        // TODO confirm that we're not finalized
        ControlToken storage controlToken = controlTokens[tokenId];

        // ensure that we're not trying to create the same lever twice
        require(controlToken.levers[leverId].exists == false, "Control lever has already been added.");

        // add the lever to this token
        controlToken.levers[leverId] = ControlLever(minValue, maxValue, startValue, true);

        // update the number of control levers that have been created for this token
        controlToken.numControlLevers++;
    }

    // Bidder functions
    function bid(uint256 tokenId) public payable {
    	// don't let owners bid on their own tokens
    	require(ownerOf(tokenId) != msg.sender, "Token owners can't bid on their own tokens.");

    	// check if there's a highest bid
    	if (highestBids[tokenId].exists) {
    		// enforce that this bid is higher (TODO require a specific amount for increments?)
    		require(msg.value > highestBids[tokenId].amount, "Bid must be higher than previous bid amount.");
    		
    		// return current second highest bidder amount back
    		if (secondHighestBids[tokenId].exists) {    			
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
    	// check if sender is owner of token
    	require(ownerOf(tokenId) != msg.sender, "Owners can't rebuy their own token.");
    	// Return all highest bidder's money
    	// Return all second highest bidder money
    	// Distribute percentage back to Artist(s) + Platform
    	// Transfer token
    	// Emit event
    }

    // Owner functions
    // Allow owner to accept the highest bid for a token
    function acceptHighestBid(uint256 tokenId) public {
    	// check if sender is owner of token
    	require(ownerOf(tokenId) == msg.sender, "Only token owners can accept bids.");
    	// check if there's a bid to accept
    	require (highestBids[tokenId].exists, "No pending bid to accept!");
    	// TODO
    	// Take highest bidder money    	
    	// Return rest of second highest bidder's money
    	// Distribute percentage back to Artist(s) + Platform
    	// reset buy price
    	buyPrices[tokenId] = 0;
    	// Transfer token
    	// Emit event
    }

    // Allows owner of a control token to set an immediate buy price
    function makeBuyPrice(uint256 tokenId, uint256 amount) public {
    	// check if sender is owner of token
    	require(ownerOf(tokenId) == msg.sender, "Only token owners can set buy price.");
    	// set the buy price
    	buyPrices[tokenId] = amount;
    	// emit event
    	emit BuyPriceSet(tokenId, amount);
    }

    // Allows owner of a control token to update its value
    // TODO take an array of lever ids and their values?
    function useControlToken(uint256 tokenId, uint256 leverId, int256 newValue) public {
    	// check if sender is owner of token
    	require(ownerOf(tokenId) == msg.sender, "Control tokens only usuable by owners.");

        // TODO confirm that this artwork is finalized

        // get the control lever
        ControlLever storage lever = controlTokens[tokenId].levers[leverId];

    	// Enforce that the new value is valid        
    	require((newValue >= lever.minValue) && (newValue <= lever.maxValue), "Invalid value.");

    	// Enforce that the new value is different
    	require(newValue != lever.currentValue, "Must provide different value.");

    	// grab previous value for the event
    	int256 previousValue = lever.currentValue;

    	// Update token current value
    	controlTokens[tokenId].levers[leverId] = ControlLever(lever.minValue, lever.maxValue, newValue, true);

    	// emit event
    	emit ControlLeverUpdated(msg.sender, tokenId, previousValue, newValue);
    }
}