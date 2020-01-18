pragma solidity ^0.5.12;

import "./ERC721.sol";
import "./ERC721Enumerable.sol";
import "./ERC721Metadata.sol";

contract AsyncArtwork is ERC721, ERC721Enumerable, ERC721Metadata {
    // An event whenever the platform address is updated
    event PlatformAddressUpdated (
        address platformAddress
    );

    event ArtistAddressUpdated (
        uint256 tokenId,
        address newArtistAddress
    );

    // An event whenever royalty amounts are updated
    event RoyaltyAmountUpdated (
        uint256 platformFirstPercentage,
        uint256 platformSecondPercentage,
        uint256 artistSecondPercentage
    );

    event TokenConfirmed (
        uint256 tokenId
    );

	// An event whenever a bid is proposed
	event BidProposed (
		uint256 tokenId,
        uint256 bidAmount
    );

	// An event whenever an bid is withdrawn
    event BidWithdrawn (
    	uint256 tokenId
    );

    // An event whenever a buy now price has been set
    event BuyPriceSet (
    	uint256 tokenId,
    	uint256 price
    );

    // An event when a token has been sold 
    event TokenSale (
        // the id of the token
        uint256 tokenId,
        // the price that the token was sold for
        uint256 salePrice,
    	// the address of the buyer
    	address buyer    	
    );

    // An event whenever a control token has been updated
    event ControlLeverUpdated (
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
        // the containing artwork token that this control token belongs to
        uint256 containingArtworkTokenId;
        // number that tracks how many levers there are
        uint256 numControlLevers;
        // false by default, true once instantiated
        bool exists;
        // the levers that this control token can use
        mapping (uint256 => ControlLever) levers;                
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
    
    // map an artwork token id to an array of its control token ids
    mapping (uint256 => uint256[]) public artworkControlTokensMapping;
    // map a control token id to a control token struct
    mapping (uint256 => ControlToken) public controlTokenIdMapping;
    // map an artwork token id to the artist address (for royalties)
    mapping (uint256 => address payable) public artistAddressMapping;
    // map control token ID to its buy price
	mapping (uint256 => uint256) public buyPrices;	
    // map a control token ID to its highest bid
	mapping (uint256 => PendingBid) public pendingBids;
    // track whether this token was sold the first time or not (used for determining whether to use first or secondary sale percentage)
    mapping (uint256 => bool) tokenDidHaveFirstSale;
    // only finalized artworks can be interacted with. All collaborating artists must confirm their token ID for a piece to finalize.
    mapping (uint256 => bool) tokenIsConfirmed;
    // mapping of addresses that are allowed to control tokens on your behalf
    mapping (address => address) public permissionedControllers;
    // the percentage of sale that the platform gets on first sales
    uint256 public platformFirstSalePercentage;
    // the percentage of sale that the platform gets on secondary sales
    uint256 public platformSecondSalePercentage;
    // the percentage of sale that an artist gets on secondary sales
    uint256 public artistSecondSalePercentage;
    // the address of the platform (for receving commissions and royalties)
    address payable private platformAddress;

	constructor (string memory name, string memory symbol) public ERC721Metadata(name, symbol) {
        platformFirstSalePercentage = 10;
        platformSecondSalePercentage = 1;
        artistSecondSalePercentage = 3;

        // by default, the platformAddress is the address that mints this contract
        platformAddress = msg.sender;
  	}

    // modifier for only allowing the platform to make a call
    modifier onlyPlatform() {
        require(msg.sender == platformAddress);
        _;    
    }

    // Allows the current platform address to update to something different
    function updatePlatformAddress(address payable newPlatformAddress) public onlyPlatform {
        platformAddress = newPlatformAddress;

        emit PlatformAddressUpdated(newPlatformAddress);
    }

    function updateArtistAddress(uint256 tokenId, address payable newArtistAddress) public {
        require(artistAddressMapping[tokenId] == msg.sender);

        artistAddressMapping[tokenId] = newArtistAddress;

        emit ArtistAddressUpdated(tokenId, newArtistAddress);
    }

    // Update the royalty percentages that platform and artists receive on first or secondary sales
    function updateRoyaltyPercentages(uint256 _platformFirstSalePercentage, uint256 _platformSecondSalePercentage, 
        uint256 _artistSecondSalePercentage) public onlyPlatform {
        // update the percentage that the platform gets on first sale
        platformFirstSalePercentage = _platformFirstSalePercentage;
        // update the percentage that the platform gets on secondary sales
        platformSecondSalePercentage = _platformSecondSalePercentage;
        // update the percentage that artists get on secondary sales
        artistSecondSalePercentage = _artistSecondSalePercentage;
        // emit an event that contains the new royalty percentage values
        emit RoyaltyAmountUpdated(platformFirstSalePercentage, platformSecondSalePercentage, artistSecondSalePercentage);
    }
    // Returns whether an artwork token has been confirmed. If a control token is passed in, check for the containing 
    // artwork and return whether that has been confirmed
    function isContainingArtworkConfirmed(uint256 artworkOrControlTokenId) public view returns (bool) {
        // if this is a control token
        if (controlTokenIdMapping[artworkOrControlTokenId].exists) {
            return tokenIsConfirmed[controlTokenIdMapping[artworkOrControlTokenId].containingArtworkTokenId];
        } else {
            return tokenIsConfirmed[artworkOrControlTokenId];
        }
    }
    function setupControlToken(uint256 artworkTokenId, uint256 controlTokenId, string memory controlTokenURI,
            int256[] memory leverMinValues, 
            int256[] memory leverMaxValues,
            int256[] memory leverStartValues
        ) public {
        // check that a control token exists for this token id
        require (controlTokenIdMapping[controlTokenId].exists, "No control token found");
        // ensure that only the control token artist is attempting this mint
        require(artistAddressMapping[controlTokenId] == msg.sender, "Must be control token artist");
        // ensure that this token is not confirmed yet
        require (tokenIsConfirmed[controlTokenId] == false, "Already confirmed");       
        // enforce that the length of all the array lengths are equal
        // require((leverMinValues.length == leverMaxValues.length) && (leverMaxValues.length == leverStartValues.length), "Values array mismatch");
        // TODO test that it's okay if you provide different start values array from min/max arrays. should still fail from below require
        // set token URI
        super._setTokenURI(controlTokenId, controlTokenURI);        
        // create the control token
        controlTokenIdMapping[controlTokenId] = ControlToken(artworkTokenId, leverStartValues.length, true);
        // create the control token levers now
        for (uint256 k = 0; k < leverStartValues.length; k++) {
            // enforce that maxValue is greater than or equal to minValue
            require (leverMaxValues[k] >= leverMinValues[k], "Max val must >= min");
            // enforce that currentValue is valid
            require((leverStartValues[k] >= leverMinValues[k]) && (leverStartValues[k] <= leverMaxValues[k]), "Invalid start val");
            // add the lever to this token
            controlTokenIdMapping[controlTokenId].levers[k] = ControlLever(leverMinValues[k],
                leverMaxValues[k], leverStartValues[k], true);
        }
        // confirm this token
        tokenIsConfirmed[controlTokenId] = true;

        emit TokenConfirmed(controlTokenId);

        bool allControlTokensConfirmed = true;
        // for each control token id
        for (uint256 k = 0; k < artworkControlTokensMapping[artworkTokenId].length; k++) {
            if (tokenIsConfirmed[artworkControlTokensMapping[artworkTokenId][k]] == false) {
                allControlTokensConfirmed = false;
                break;
            }
        }
        // if all the control tokens for the containing artwork have been confirmed, then the containing artwork token sis confirmed
        if (allControlTokensConfirmed) {
            tokenIsConfirmed[artworkTokenId] = true;            
            
            emit TokenConfirmed(artworkTokenId);
        }
    }
    function mintArtwork(uint256 artworkTokenId, string memory artworkTokenURI, address payable[] memory controlTokenArtists
    ) public onlyPlatform {
        require (artworkTokenId == totalSupply(), "TotalSupply different");
        // Mint the token that represents ownership of the entire artwork    
        super._safeMint(msg.sender, artworkTokenId);
        super._setTokenURI(artworkTokenId, artworkTokenURI);        
        // track the msg.sender address as the artist address for future royalties
        artistAddressMapping[artworkTokenId] = msg.sender;
        // iterate through all control token URIs (1 for each control token)
        for (uint256 i = 0; i < controlTokenArtists.length; i++) {
            // use the curren token supply as the next token id
            uint256 controlTokenId = totalSupply();
            // stub in an existing control token so exists is true
            controlTokenIdMapping[controlTokenId] = ControlToken(artworkTokenId, 0, true);
            // map the provided control token artist to its control token ID
            artistAddressMapping[controlTokenId] = controlTokenArtists[i];            
            // mint the control token
            super._safeMint(controlTokenArtists[i], controlTokenId);            
            // track the control ids mapped to each artwork token id
            artworkControlTokensMapping[artworkTokenId].push(controlTokenId);
        }
        if (controlTokenArtists.length == 0) {
            tokenIsConfirmed[artworkTokenId] = true;

            emit TokenConfirmed(artworkTokenId);
        }
    }
    // Bidder functions
    function bid(uint256 tokenId) public payable {
    	// don't let owners/approved bid on their own tokens
        require(_isApprovedOrOwner(msg.sender, tokenId) == false);
        // enforce that this artwork (or containing artwork if it's a control token) has been confirmed
        require(isContainingArtworkConfirmed(tokenId), "Art not confirmed");
    	// check if there's a high bid
    	if (pendingBids[tokenId].exists) {
    		// enforce that this bid is higher
    		require(msg.value > pendingBids[tokenId].amount, "Bid must be > than current bid");
            // Return bid amount back to bidder
            pendingBids[tokenId].bidder.transfer(pendingBids[tokenId].amount);
    	}
    	// set the new highest bid
    	pendingBids[tokenId] = PendingBid(msg.sender, msg.value, true);
    	// Emit event for the bid proposal
    	emit BidProposed(tokenId, msg.value);
    }
    // allows an address with a pending bid to withdraw it
    function withdrawBid(uint256 tokenId) public {
        // check that there is a bid from the sender to withdraw
        require (pendingBids[tokenId].exists && (pendingBids[tokenId].bidder == msg.sender));
    	// Return bid amount back to bidder
        pendingBids[tokenId].bidder.transfer(pendingBids[tokenId].amount);
		// clear highest bid
		pendingBids[tokenId] = PendingBid(address(0), 0, false);
		// emit an event when the highest bid is withdrawn
		emit BidWithdrawn(tokenId);
    }
    // Buy the artwork for the currently set price
    function takeBuyPrice(uint256 tokenId) public payable {
        // don't let owners/approved buy their own tokens
        require(_isApprovedOrOwner(msg.sender, tokenId) == false);
        // get the sale amount
        uint256 saleAmount = buyPrices[tokenId];
        // check that there is a buy price
        require(saleAmount > 0);
        // check that the buyer sent enough to purchase
        require (msg.value >= saleAmount);
    	// Return all highest bidder's money
        if (pendingBids[tokenId].exists) {
            // Return bid amount back to bidder
            pendingBids[tokenId].bidder.transfer(pendingBids[tokenId].amount);
            // clear highest bid
            pendingBids[tokenId] = PendingBid(address(0), 0, false);
        }        
        onTokenSold(tokenId, saleAmount, msg.sender);
    }

    function onTokenSold(uint256 tokenId, uint256 saleAmount, address to) private {
        // distribute the proceeds from the sale
        // the amount that the platform gets from this sale (depends on whether this is first sale or not)
        uint256 platformAmount;
        uint256 hundred = 100;
        // if the first sale already happened, then give the artist + platform the secondary royalty percentage
        if (tokenDidHaveFirstSale[tokenId]) {
            // mark down that this first sale occurred
            tokenDidHaveFirstSale[tokenId] = true;
            // calculate the artist royalty
            uint256 artistAmount = hundred.sub(artistSecondSalePercentage).div(hundred).mul(saleAmount);
            // transfer the artist's royalty
            artistAddressMapping[tokenId].transfer(artistAmount);            
            // calculate the platform royalty
            platformAmount = hundred.sub(platformSecondSalePercentage).div(hundred).mul(saleAmount);
            // deduct the artist amount from the payment amount
            saleAmount = saleAmount.sub(artistAmount);
        } else {
            // else if this is the first sale for the token, give the platform the first sale royalty percentage
            platformAmount = hundred.sub(platformFirstSalePercentage).div(hundred).mul(saleAmount);
        }
        // give platform its royalty
        platformAddress.transfer(platformAmount);
        // deduct the platform amount from the payment amount
        saleAmount = saleAmount.sub(platformAmount);
        // cast the owner to a payable address
        address payable payableOwner = address(uint160(ownerOf(tokenId)));
        // transfer the remaining amount to the owner of the token
        payableOwner.transfer(saleAmount);
        // Transfer token to msg.sender
        safeTransferFrom(ownerOf(tokenId), to, tokenId);
        // clear the approval for this token
        approve(address(0), tokenId);
        // reset buy price
        buyPrices[tokenId] = 0;
        // clear highest bid
        pendingBids[tokenId] = PendingBid(address(0), 0, false);
        // Emit event
        emit TokenSale(tokenId, saleAmount, to);
    }

    // Owner functions
    // Allow owner to accept the highest bid for a token
    function acceptBid(uint256 tokenId) public {
    	// check if sender is owner/approved of token        
        require(_isApprovedOrOwner(msg.sender, tokenId));
    	// check if there's a bid to accept
    	require (pendingBids[tokenId].exists);
        // process the sale
        onTokenSold(tokenId, pendingBids[tokenId].amount, pendingBids[tokenId].bidder);
    }

    // Allows owner of a control token to set an immediate buy price. Set to 0 to reset.
    function makeBuyPrice(uint256 tokenId, uint256 amount) public {
    	// check if sender is owner/approved of token        
    	require(_isApprovedOrOwner(msg.sender, tokenId));
        // enforce that this artwork (or containing artwork if it's a control token) has been confirmed
        require(isContainingArtworkConfirmed(tokenId), "Art not confirmed");
    	// set the buy price
    	buyPrices[tokenId] = amount;
    	// emit event
    	emit BuyPriceSet(tokenId, amount);
    }

    // return the min, max, and current value of a control lever
    function getControlLever(uint256 controlTokenId, uint256 leverId) public view returns (int256[] memory) {
        int256[] memory lever = new int256[](3);

        lever[0] = controlTokenIdMapping[controlTokenId].levers[leverId].minValue;
        lever[1] = controlTokenIdMapping[controlTokenId].levers[leverId].maxValue;
        lever[2] = controlTokenIdMapping[controlTokenId].levers[leverId].currentValue;

        return lever;
    }
    // anyone can grant permission to another address to control tokens on their behalf. Set to Address(0) to reset.
    function grantControlPermission(address permissioned) public {
        permissionedControllers[msg.sender] = permissioned;
    }

    // Allows owner (or permissioned user) of a control token to update its lever values
    function useControlToken(uint256 controlTokenId, uint256[] memory leverIds, int256[] memory newValues) public {
    	// check if sender is owner/approved of token OR if they're a permissioned controller for the token owner      
        require(_isApprovedOrOwner(msg.sender, controlTokenId) || (permissionedControllers[ownerOf(controlTokenId)] == msg.sender),
            "Owner or permissioned only");
        // enforce that this artwork (or containing artwork if it's a control token) has been confirmed
        require(isContainingArtworkConfirmed(controlTokenId), "Art not confirmed");
 
        // collect the previous lever values for the event emit below
        int256[] memory previousValues = new int256[](newValues.length);

        for (uint256 i = 0; i < leverIds.length; i++) {
            // get the control lever
            ControlLever storage lever = controlTokenIdMapping[controlTokenId].levers[leverIds[i]];

            // Enforce that the new value is valid        
            require((newValues[i] >= lever.minValue) && (newValues[i] <= lever.maxValue), "Invalid val");

            // Enforce that the new value is different
            require(newValues[i] != lever.currentValue, "Must provide different val");

            // grab previous value for the event emit
            int256 previousValue = lever.currentValue;
            
            // Update token current value
            lever.currentValue = newValues[i];

            // collect the previous lever values for the event emit below
            previousValues[i] = previousValue;
        }
        
    	// emit event
    	emit ControlLeverUpdated(controlTokenId, leverIds, previousValues, newValues);
    }
}