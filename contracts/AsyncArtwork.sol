pragma solidity ^0.5.12;

import "./ERC721.sol";
import "./ERC721Enumerable.sol";
import "./ERC721Metadata.sol";

contract AsyncArtwork is ERC721, ERC721Enumerable, ERC721Metadata {
    // An event whenever the platform address is updated
    event PlatformAddressUpdated (
        address platformAddress
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
    

    mapping (uint256 => address payable[]) uniqueTokenCreators;
    // map a control token id to a control token struct
    mapping (uint256 => ControlToken) controlTokenMapping;
    // map control token ID to its buy price
	mapping (uint256 => uint256) public buyPrices;	
    // map a control token ID to its highest bid
	mapping (uint256 => PendingBid) public pendingBids;
    // track whether this token was sold the first time or not (used for determining whether to use first or secondary sale percentage)
    mapping (uint256 => bool) tokenDidHaveFirstSale;
    // only finalized artworks can be interacted with. All collaborating artists must confirm their token ID for a piece to finalize.
    mapping (uint256 => bool) public tokenIsConfirmed;
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
    function setupControlToken(uint256 artworkTokenId, uint256 controlTokenId, string memory controlTokenURI,
            int256[] memory leverMinValues, 
            int256[] memory leverMaxValues,
            int256[] memory leverStartValues
        ) public {
        // check that a control token exists for this token id
        require (controlTokenMapping[controlTokenId].exists, "No control token found");
        // ensure that this token is not confirmed yet
        require (tokenIsConfirmed[controlTokenId] == false, "Already confirmed");
        // enforce that artworkTokenId is correct
        require (controlTokenMapping[controlTokenId].containingArtworkTokenId == artworkTokenId);
        // ensure that only the control token artist is attempting this mint
        require(uniqueTokenCreators[controlTokenId][0] == msg.sender, "Must be control token artist");        
        // enforce that the length of all the array lengths are equal
        // require((leverMinValues.length == leverMaxValues.length) && (leverMaxValues.length == leverStartValues.length), "Values array mismatch");
        // TODO test that it's okay if you provide different start values array from min/max arrays. should still fail from below require
        // set token URI
        super._setTokenURI(controlTokenId, controlTokenURI);        
        // create the control token
        controlTokenMapping[controlTokenId] = ControlToken(artworkTokenId, leverStartValues.length, true);
        // create the control token levers now
        for (uint256 k = 0; k < leverStartValues.length; k++) {
            // enforce that maxValue is greater than or equal to minValue
            require (leverMaxValues[k] >= leverMinValues[k], "Max val must >= min");
            // enforce that currentValue is valid
            require((leverStartValues[k] >= leverMinValues[k]) && (leverStartValues[k] <= leverMaxValues[k]), "Invalid start val");
            // add the lever to this token
            controlTokenMapping[controlTokenId].levers[k] = ControlLever(leverMinValues[k],
                leverMaxValues[k], leverStartValues[k], true);
        }
        // confirm this token
        tokenIsConfirmed[controlTokenId] = true;

        emit TokenConfirmed(controlTokenId);
    }
    function mintArtwork(uint256 artworkTokenId, string memory artworkTokenURI, address payable[] memory controlTokenArtists
    ) public onlyPlatform {
        require (artworkTokenId == totalSupply(), "TotalSupply different");
        // Mint the token that represents ownership of the entire artwork    
        super._safeMint(msg.sender, artworkTokenId);
        super._setTokenURI(artworkTokenId, artworkTokenURI);        
        // track the msg.sender address as the artist address for future royalties
        uniqueTokenCreators[artworkTokenId].push(msg.sender);

        tokenIsConfirmed[artworkTokenId] = true;

        // iterate through all control token URIs (1 for each control token)
        for (uint256 i = 0; i < controlTokenArtists.length; i++) {
            // use the curren token supply as the next token id
            uint256 controlTokenId = totalSupply();

            uniqueTokenCreators[controlTokenId].push(controlTokenArtists[i]);
            // stub in an existing control token so exists is true
            controlTokenMapping[controlTokenId] = ControlToken(artworkTokenId, 0, true);
            // mint the control token
            super._safeMint(controlTokenArtists[i], controlTokenId);

            if (controlTokenArtists[i] != msg.sender) {
                bool containsControlTokenArtist = false;

                for (uint256 k = 0; k < uniqueTokenCreators[artworkTokenId].length; k++) {
                    if (uniqueTokenCreators[artworkTokenId][k] == controlTokenArtists[i]) {
                        containsControlTokenArtist = true;
                        break;
                    }
                }
                if (containsControlTokenArtist == false) {
                    uniqueTokenCreators[artworkTokenId].push(controlTokenArtists[i]);
                }
            }
        }
    }
    // Bidder functions
    function bid(uint256 tokenId) public payable {
    	// don't let owners/approved bid on their own tokens
        require(_isApprovedOrOwner(msg.sender, tokenId) == false);        
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

    function distributeFundsToCreators(uint256 amount, address payable[] memory creators) private {
        uint256 creatorShare = amount.div(creators.length);

        for (uint256 i = 0; i < creators.length; i++) {
            creators[i].transfer(creatorShare);
        }
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
            distributeFundsToCreators(artistAmount, uniqueTokenCreators[tokenId]);
            // calculate the platform royalty
            platformAmount = hundred.sub(platformSecondSalePercentage).div(hundred).mul(saleAmount);
            // give platform its royalty
            platformAddress.transfer(platformAmount);
            // deduct the artist amount from the payment amount
            saleAmount = saleAmount.sub(artistAmount);
            // deduct the platform amount from the payment amount
            saleAmount = saleAmount.sub(platformAmount);            
            // cast the owner to a payable address
            address payable payableOwner = address(uint160(ownerOf(tokenId)));
            // transfer the remaining amount to the owner of the token
            payableOwner.transfer(saleAmount);
        } else {
            // else if this is the first sale for the token, give the platform the first sale royalty percentage
            platformAmount = hundred.sub(platformFirstSalePercentage).div(hundred).mul(saleAmount);
            // deduct the platform amount from the payment amount
            saleAmount = saleAmount.sub(platformAmount);
            // this is a token first sale, so distribute the funds to the unique token creators of this token
            // (if it's a base token it will be all the unique creators, if it's a control token it will be that single artist)
            distributeFundsToCreators(saleAmount, uniqueTokenCreators[tokenId]);            
        }        
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
    	// set the buy price
    	buyPrices[tokenId] = amount;
    	// emit event
    	emit BuyPriceSet(tokenId, amount);
    }

    // return the min, max, and current value of a control lever
    function getControlToken(uint256 controlTokenId) public view returns (int256[] memory) {
        require(controlTokenMapping[controlTokenId].exists);
        
        ControlToken storage controlToken = controlTokenMapping[controlTokenId];

        int256[] memory returnValues = new int256[](controlToken.numControlLevers.mul(3));
        uint256 returnValIndex = 0;

        // iterate through all the control levers for this control token
        for (uint256 i = 0; i < controlToken.numControlLevers; i++) {        
            returnValues[returnValIndex] = controlToken.levers[i].minValue;
            returnValIndex = returnValIndex.add(1);

            returnValues[returnValIndex] = controlToken.levers[i].maxValue;
            returnValIndex = returnValIndex.add(1);

            returnValues[returnValIndex] = controlToken.levers[i].currentValue; 
            returnValIndex = returnValIndex.add(1);
        }        

        return returnValues;
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
        // collect the previous lever values for the event emit below
        int256[] memory previousValues = new int256[](newValues.length);

        for (uint256 i = 0; i < leverIds.length; i++) {
            // get the control lever
            ControlLever storage lever = controlTokenMapping[controlTokenId].levers[leverIds[i]];

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