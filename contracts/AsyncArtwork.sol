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
        // the ids of the levers that were updated
        uint256[] leverIds,
    	// the previous values that the levers had before this update (for clients who want to animate the change)
    	int256[] previousValues,
    	// the new updated value
    	int256[] updatedValues
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

    // map control token id to a control token struct
	mapping (uint256 => ControlToken) public controlTokenMapping;
    // array of all the control token ids (excluding owner token)
    uint256[] public controlTokenIds;	
    // map control token ID to its buy price
	mapping (uint256 => uint256) public buyPrices;	
    // map a control token ID to its highest bid
	mapping (uint256 => PendingBid) public highestBids;
    // map a control token ID to its second highest bid
	mapping (uint256 => PendingBid) public secondHighestBids;
    // reserved constant for the owner token ID    
    uint256 private constant OWNER_TOKEN_ID = 0;
    // the expected number of control tokens this art will have
	uint256 private _expectedNumControlTokens;
    // the current number of control tokens this art has
	uint256 public numControlTokens;

	constructor (string memory name, string memory symbol, uint256 expectedNumControlTokens) public 
  		ERC721Full(name, symbol) {	

  		_expectedNumControlTokens = expectedNumControlTokens;
  	}
  	
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
        controlTokenMapping[tokenId] = ControlToken(expectedNumControlLevers, 0);
        // track an array of our token ids
        controlTokenIds.push(tokenId);
        // increase control token counter
        numControlTokens++;
    }

    // modifier to ensure that an artwork has minted all its tokens and is finalized for use
    modifier isArtworkFinalized() {
        require (numControlTokens == _expectedNumControlTokens, "All control tokens must be minted first.");

        for (uint i = 0; i < numControlTokens; i++) {
            uint256 tokenId = controlTokenIds[i];

            require (controlTokenMapping[tokenId].numControlLevers == controlTokenMapping[tokenId].expectedNumControlLevers, "All control tokens must have their expected levers set up.");
        }
        
        _;
    }

    // add control lever(s) to a control token
    function addControlTokenLevers(uint256 tokenId, uint256[] memory leverIds, int256[] memory minValues, int256[] memory maxValues,
            int256[] memory startValues) public {
        // enforce that at least 1 lever id is passed in
        require(leverIds.length > 0, "Must pass in at least 1 lever id.");
        // enforce that the length of all the array lengths are equal
        require((leverIds.length == minValues.length) && (minValues.length == maxValues.length) && (maxValues.length == startValues.length),
            "LeverIds, MinValues, MaxValues, and StartValues arrays must be same length.");

        // // TODO require msg.sender is one of the initial artists
        ControlToken storage controlToken = controlTokenMapping[tokenId];    

        // for each array...
        for (uint i = 0; i < leverIds.length; i++) {
            // enforce that maxValue is greater than or equal to minValue
            require (maxValues[i] >= minValues[i], "Max value must be greater than or equal to min value.");

            // enforce that currentValue is valid
            require((startValues[i] >= minValues[i]) && (startValues[i] <= maxValues[i]), "Invalid start value.");

            // ensure that there's still some room for levers to be added
            require (controlToken.numControlLevers < controlToken.expectedNumControlLevers, "Control lever has already been added.");

            // ensure that we're not trying to create the same lever twice
            require(controlToken.levers[leverIds[i]].exists == false, "Control lever has already been added.");

            // add the lever to this token
            controlToken.levers[leverIds[i]] = ControlLever(minValues[i], maxValues[i], startValues[i], true);

            // update the number of control levers that have been created for this token
            controlToken.numControlLevers++;
        }        
    }

    // Bidder functions
    function bid(uint256 tokenId) public payable isArtworkFinalized {
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
    function withdrawBid(uint256 tokenId) public isArtworkFinalized {
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

    // Buy the artwork for the currently set price
    function takeBuyPrice(uint256 tokenId) public payable isArtworkFinalized {
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
    function acceptHighestBid(uint256 tokenId) public isArtworkFinalized {
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
    function makeBuyPrice(uint256 tokenId, uint256 amount) public isArtworkFinalized {
    	// check if sender is owner of token
    	require(ownerOf(tokenId) == msg.sender, "Only token owners can set buy price.");
    	// set the buy price
    	buyPrices[tokenId] = amount;
    	// emit event
    	emit BuyPriceSet(tokenId, amount);
    }

    // used during the render process to determine values
    function getControlLeverValue(uint256 tokenId, uint256 leverId) public view isArtworkFinalized returns (int256) {
        return controlTokenMapping[tokenId].levers[leverId].currentValue;
    }

    // used for token owners to know the range of values they can use for a control lever.
    function getControlLeverMinMax(uint256 tokenId, uint256 leverId) public view isArtworkFinalized returns (int256[] memory) {
        int256[] memory minMax = new int256[](2);

        minMax[0] = controlTokenMapping[tokenId].levers[leverId].minValue;
        minMax[1] = controlTokenMapping[tokenId].levers[leverId].maxValue;

        return minMax;
    }

    // Allows owner of a control token to update its lever values
    function useControlToken(uint256 tokenId, uint256[] memory leverIds, int256[] memory newValues) public isArtworkFinalized {
    	// check if sender is owner of token
    	require(ownerOf(tokenId) == msg.sender, "Control tokens only usuable by owners.");

        // collect the previous lever values for the event emit below
        int256[] memory previousValues = new int256[](newValues.length);

        for (uint i = 0; i < leverIds.length; i++) {
            // get the control lever
            ControlLever storage lever = controlTokenMapping[tokenId].levers[leverIds[i]];

            // Enforce that the new value is valid        
            require((newValues[i] >= lever.minValue) && (newValues[i] <= lever.maxValue), "Invalid value.");

            // Enforce that the new value is different
            require(newValues[i] != lever.currentValue, "Must provide different value.");

            // grab previous value for the event emit
            int256 previousValue = lever.currentValue;
            
            // Update token current value
            lever.currentValue = newValues[i];

            // collect the previous lever values for the event emit below
            previousValues[i] = previousValue;
        }
        
    	// emit event
    	emit ControlLeverUpdated(msg.sender, tokenId, leverIds, previousValues, newValues);
    }
}