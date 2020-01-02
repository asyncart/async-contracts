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
        // number that tracks how many levers there are
        uint256 numControlLevers;
    }

    // struct for a lever on a control token that can be changed
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
    // map an artwork token id to an array of control token ids
    mapping (uint256 => uint256[]) public artworkControlTokensMapping;

    // map control token ID to its buy price
	mapping (uint256 => uint256) public buyPrices;	
    // map a control token ID to its highest bid
	mapping (uint256 => PendingBid) public highestBids;

	constructor (string memory name, string memory symbol) public 
  		ERC721Full(name, symbol) {
  	}

    modifier onlyWhitelistedArtist() {
        // TODO check for whitelisted creator address
        _;
    }

    function substring(string memory str, uint startIndex, uint endIndex) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(endIndex-startIndex);
        for(uint i = startIndex; i < endIndex; i++) {
            result[i-startIndex] = strBytes[i];
        }
        return string(result);
    }
  	
  	// Mint a piece of artwork   
    function mintArtwork(address to, uint256 artworkTokenId, string memory artworkTokenURI, 
        uint256[] memory newControlTokenIds,
        uint256[] memory newControlTokenURIEndIndices,
        string memory newControlTokenURIs,
        uint256[] memory numLeversPerControlToken,
        uint256[] memory leverIds,
        int256[] memory minValues, 
        int256[] memory maxValues,
        int256[] memory startValues
    ) public onlyWhitelistedArtist {
        // enforce that at least 1 lever id is passed in
        require(leverIds.length > 0, "Must pass in at least 1 lever id.");
        // enforce that the length of all the array lengths are equal
        require((leverIds.length == minValues.length) && (minValues.length == maxValues.length) && (maxValues.length == startValues.length),
            "LeverIds, MinValues, MaxValues, and StartValues arrays must be same length.");
        // enforce that URI end indices is same length as as control token ids (must be 1 URI for each control token)
        require(newControlTokenURIEndIndices.length == newControlTokenIds.length, 
            "newControlTokenIds and newControlTokenURIEndIndices must be same length.");

        // Mint the token that represents ownership of the entire artwork    
        super._safeMint(to, artworkTokenId);
        super._setTokenURI(artworkTokenId, artworkTokenURI);

        uint256 controlTokenLeverIndex = 0;
        uint256 controlTokenURIIndex = 0;

        // iterate through all control token ids
        for (uint256 i = 0; i < newControlTokenIds.length; i++) {
            uint256 controlTokenId = newControlTokenIds[i];

            // mint the control token
            super._safeMint(to, controlTokenId);
            // set the URI
            super._setTokenURI(controlTokenId, substring(newControlTokenURIs, controlTokenURIIndex, newControlTokenURIEndIndices[i]));

            // move control token URI to the last used end index
            controlTokenURIIndex = newControlTokenURIEndIndices[i];

            // create the control token
            controlTokenMapping[controlTokenId] = ControlToken(numLeversPerControlToken[i]);

            // track the control ids mapped to each artwork token id
            artworkControlTokensMapping[artworkTokenId].push(controlTokenId);

            // create the control token levers now
            for (uint256 k = 0; k < numLeversPerControlToken[i]; k++) {
                // enforce that maxValue is greater than or equal to minValue
                require (maxValues[controlTokenLeverIndex] >= minValues[controlTokenLeverIndex], "Max value must be greater than or equal to min value.");
                // enforce that currentValue is valid
                require((startValues[controlTokenLeverIndex] >= minValues[controlTokenLeverIndex]) && 
                    (startValues[controlTokenLeverIndex] <= maxValues[controlTokenLeverIndex]), "Invalid start value.");
                // add the lever to this token
                controlTokenMapping[controlTokenId].levers[k] = ControlLever(minValues[controlTokenLeverIndex],
                    maxValues[controlTokenLeverIndex], startValues[controlTokenLeverIndex], true);
                // increment the control token lever index
                controlTokenLeverIndex++;
            }
        }
    }

    // Bidder functions
    function bid(uint256 tokenId) public payable {
    	// don't let owners bid on their own tokens
    	require(ownerOf(tokenId) != msg.sender, "Token owners can't bid on their own tokens.");

    	// check if there's a highest bid
    	if (highestBids[tokenId].exists) {
    		// enforce that this bid is higher (TODO require a specific amount for increments?)
    		require(msg.value > highestBids[tokenId].amount, "Bid must be higher than previous bid amount.");

            // Return bid amount back to bidder
            highestBids[tokenId].bidder.transfer(highestBids[tokenId].amount);
    	}

    	// set the new highest bid
    	highestBids[tokenId] = PendingBid(msg.sender, msg.value, true);

    	// Emit event for the bid proposal
    	emit BidProposed(msg.sender, tokenId, msg.value);
    }

    // allows an address with a pending bid to withdraw it
    function withdrawBid(uint256 tokenId) public {
        // check that there is a bid from the sender to withdraw
        require (((highestBids[tokenId].exists) && (highestBids[tokenId].bidder == msg.sender)), "No bid from msg.sender to withdraw.");
    	// Return bid amount back to bidder
        highestBids[tokenId].bidder.transfer(highestBids[tokenId].amount);
		// clear highest bid
		highestBids[tokenId] = PendingBid(address(0), 0, false);			
		// emit an event when the highest bid is withdrawn
		emit BidWithdrawn(msg.sender, tokenId);
    }

    // Buy the artwork for the currently set price
    function takeBuyPrice(uint256 tokenId) public payable {
    	// TODO
    	// check if sender is owner of token
    	require(ownerOf(tokenId) != msg.sender, "Owners can't rebuy their own token.");
    	// Return all highest bidder's money
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

    // used during the render process to determine values
    function getControlLeverValue(uint256 tokenId, uint256 leverId) public view returns (int256) {
        return controlTokenMapping[tokenId].levers[leverId].currentValue;
    }

    // used for token owners to know the range of values they can use for a control lever.
    function getControlLeverMinMax(uint256 tokenId, uint256 leverId) public view returns (int256[] memory) {
        int256[] memory minMax = new int256[](2);

        minMax[0] = controlTokenMapping[tokenId].levers[leverId].minValue;
        minMax[1] = controlTokenMapping[tokenId].levers[leverId].maxValue;

        return minMax;
    }

    // Allows owner of a control token to update its lever values
    function useControlToken(uint256 tokenId, uint256[] memory leverIds, int256[] memory newValues) public {
    	// check if sender is owner of token
    	require(ownerOf(tokenId) == msg.sender, "Control tokens only usuable by owners.");

        // collect the previous lever values for the event emit below
        int256[] memory previousValues = new int256[](newValues.length);

        for (uint256 i = 0; i < leverIds.length; i++) {
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