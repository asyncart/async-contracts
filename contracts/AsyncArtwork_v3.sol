pragma solidity ^0.5.12;

import "./ERC721.sol";
import "./ERC721Enumerable.sol";
import "./ERC721Metadata.sol";

contract HasSecondarySaleFees is ERC165 {
    event SecondarySaleFees(uint256 tokenId, address[] recipients, uint[] bps);

    /*
     * bytes4(keccak256('getFeeBps(uint256)')) == 0x0ebd4c7f
     * bytes4(keccak256('getFeeRecipients(uint256)')) == 0xb9c4d9fb
     *
     * => 0x0ebd4c7f ^ 0xb9c4d9fb == 0xb7799584
     */
    bytes4 private constant _INTERFACE_ID_FEES = 0xb7799584;

    function initialize() public initializer {
        _registerInterface(_INTERFACE_ID_FEES);
    }

    function getFeeRecipients(uint256 id) public view returns (address payable[] memory);
    function getFeeBps(uint256 id) public view returns (uint[] memory);
}

// Copyright (C) 2021 Asynchronous Art, Inc.
// GNU General Public License v3.0
// Full notice https://github.com/asyncart/async-contracts/blob/master/LICENSE

contract AsyncArtwork_v3 is Initializable, ERC721, ERC721Enumerable, ERC721Metadata, HasSecondarySaleFees {
    // An event whenever the platform address is updated
    event PlatformAddressUpdated(
        address platformAddress
    );

    event PermissionUpdated(
        uint256 tokenId,
        address tokenOwner,
        address permissioned
    );

    // An event whenever a creator is whitelisted with the token id and the layer count
    event CreatorWhitelisted(
        uint256 tokenId,
        uint256 layerCount,
        address creator
    );

    // An event whenever royalty amount for a token is updated
    event PlatformRoyaltyUpdated (
        uint256 tokenId,
        uint256 platformRoyalty
    );

    // An event whenever artist royalty is updated
    event ArtistRoyaltyUpdated (
        uint256 artistRoyalty
    );

    // An event when a control token is initialized
    event ControlTokenInitialized (
        int256[] leverMinValues,
        int256[] leverMaxValues,
        int256[] leverStartValues,
        int256 numAllowedUpdates
    );

    // An event whenever a control token has been updated
    event ControlLeverUpdated(
        // the id of the token
        uint256 tokenId,
        // an optional amount that the updater sent to boost priority of the rendering
        uint256 priorityTip,
        // the number of times this control lever can now be updated
        int256 numRemainingUpdates,
        // the ids of the levers that were updated
        uint256[] leverIds,        
        // the previous values that the levers had before this update (for clients who want to animate the change)
        int256[] previousValues,
        // the new updated value
        int256[] updatedValues
    );

    // struct for a token that controls part of the artwork
    struct ControlToken {
        // number that tracks how many levers there are
        uint256 numControlLevers;
        // The number of update calls this token has (-1 for infinite)
        int256 numRemainingUpdates;
        // false by default, true once instantiated
        bool exists;
        // false by default, true once setup by the artist
        bool isSetup;
        // the levers that this control token can use
        mapping(uint256 => ControlLever) levers;
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

    struct WhitelistReservation {
        // the address of the creator
        address creator;
        // the amount of layers they're expected to mint
        uint256 layerCount;
    }
    
    // mapping of addresses to credits for failed transfers
    mapping(address => uint256) public failedTransferCredits;
    // mapping of tokenId to percentage of sale that the platform gets on sales (basis points, 10,000)
    mapping(uint256 => uint256) public platformRoyalties;
    // what tokenId creators are allowed to mint (and how many layers)
    mapping(uint256 => WhitelistReservation) public creatorWhitelist;
    // for each token, holds an array of the creator collaborators. For layer tokens it will likely just be [artist], for master tokens it may hold multiples
    mapping(uint256 => address payable[]) public uniqueTokenCreators;    
    // map a control token id to a control token struct
    mapping(uint256 => ControlToken) public controlTokenMapping;    
    // mapping of addresses that are allowed to control tokens on your behalf
    mapping(address => mapping(uint256 => address)) public permissionedControllers;
    // the percentage of sale that an artist gets on sales (basis points, 10,000)
    uint256 public artistRoyalty;
    // gets incremented to placehold for tokens not minted yet
    uint256 public expectedTokenSupply;
    // the address of the platform (for receving commissions and royalties)
    address payable public platformAddress;
    // the address of the contract that can whitelist artists to mint
    address public minterAddress;

    function initialize(string memory name, string memory symbol, uint256 initialExpectedTokenSupply) public initializer {
        ERC721.initialize();
        ERC721Enumerable.initialize();
        ERC721Metadata.initialize(name, symbol);
        HasSecondarySaleFees.initialize();

        // starting royalty amounts (basis points out of 10,000)
        artistRoyalty = 1000;

        // by default, the platformAddress is the address that mints this contract
        platformAddress = msg.sender;

        // set the initial expected token supply       
        expectedTokenSupply = initialExpectedTokenSupply;

        require(expectedTokenSupply > 0);
    }

    // modifier for only allowing the platform to make a call
    modifier onlyPlatform() {
        require(msg.sender == platformAddress);
        _;
    }

    // modifier for only allowing the minter to make a call
    modifier onlyMinter() {
        require(msg.sender == minterAddress);
        _;
    }

    modifier onlyWhitelistedCreator(uint256 masterTokenId, uint256 layerCount) {
        require(creatorWhitelist[masterTokenId].creator == msg.sender);
        require(creatorWhitelist[masterTokenId].layerCount == layerCount);
        _;
    }

    function setExpectedTokenSupply(uint256 newExpectedTokenSupply) external onlyPlatform {
        expectedTokenSupply = newExpectedTokenSupply;
    }

    // reserve a tokenID and layer count for a creator. Define a platform royalty percentage per art piece (some pieces have higher or lower amount)
    function whitelistTokenForCreator(address creator, uint256 masterTokenId, uint256 layerCount, uint256 platformRoyalty) external onlyMinter {
        // the tokenID we're reserving must be the current expected token supply
        require(masterTokenId == expectedTokenSupply);
        // reserve the tokenID for this creator
        creatorWhitelist[masterTokenId] = WhitelistReservation(creator, layerCount);
        // increase the expected token supply
        expectedTokenSupply = masterTokenId.add(layerCount).add(1);
        // define the platform percentages for this token here
        platformRoyalties[masterTokenId] = platformRoyalty;

        emit CreatorWhitelisted(masterTokenId, layerCount, creator);
    }

    // Allows the platform to change the minter address
    function updateMinterAddress(address newMinterAddress) external onlyPlatform {
        minterAddress = newMinterAddress;
    }

    // Allows the current platform address to update to something different
    function updatePlatformAddress(address payable newPlatformAddress) external onlyPlatform {
        platformAddress = newPlatformAddress;

        emit PlatformAddressUpdated(newPlatformAddress);
    }
    // Allows platform to change the royalty percentage for a specific token
    function updatePlatformRoyalty(uint256 tokenId, uint256 platformRoyalty) external onlyPlatform {
        // set the percentages for this token
        platformRoyalties[tokenId] = platformRoyalty;
        // emit an event to notify that the platform percent for this token has changed
        emit PlatformRoyaltyUpdated(tokenId, platformRoyalty);
    }    
    // Allow the platform to update a token's URI if it's not locked yet (for fixing tokens post mint process)
    function updateTokenURI(uint256 tokenId, string calldata tokenURI) external onlyPlatform {
        // ensure that this token exists
        require(_exists(tokenId));
        // update the token URI
        super._setTokenURI(tokenId, tokenURI);
    }

    // Allows platform to change the percentage that artists receive
    function updateArtistRoyalty(uint256 _artistRoyalty) external onlyPlatform {
        // update the percentage that artists get for sales
        artistRoyalty = _artistRoyalty;
        // emit an event to notify that the artist royalty has updated
        emit ArtistRoyaltyUpdated(_artistRoyalty);
    }

    function setupControlToken(uint256 controlTokenId, string calldata controlTokenURI,
        int256[] calldata leverMinValues,
        int256[] calldata leverMaxValues,
        int256[] calldata leverStartValues,
        int256 numAllowedUpdates,
        address payable[] calldata additionalCollaborators
    ) external {
        // Hard cap the number of levers a single control token can have
        require (leverMinValues.length <= 500, "Too many control levers.");
        // Hard cap the number of collaborators a single control token can have
        require (additionalCollaborators.length <= 50, "Too many collaborators.");
        // check that a control token exists for this token id
        require(controlTokenMapping[controlTokenId].exists, "No control token found");
        // ensure that this token is not setup yet
        require(controlTokenMapping[controlTokenId].isSetup == false, "Already setup");
        // ensure that only the control token artist is attempting this mint
        require(uniqueTokenCreators[controlTokenId][0] == msg.sender, "Must be control token artist");
        // enforce that the length of all the array lengths are equal
        require((leverMinValues.length == leverMaxValues.length) && (leverMaxValues.length == leverStartValues.length), "Values array mismatch");
        // require the number of allowed updates to be infinite (-1) or some finite number
        require((numAllowedUpdates == -1) || (numAllowedUpdates > 0), "Invalid allowed updates");
        // mint the control token here
        super._safeMint(msg.sender, controlTokenId);
        // set token URI
        super._setTokenURI(controlTokenId, controlTokenURI);        
        // create the control token
        controlTokenMapping[controlTokenId] = ControlToken(leverStartValues.length, numAllowedUpdates, true, true);
        // create the control token levers now
        for (uint256 k = 0; k < leverStartValues.length; k++) {
            // enforce that maxValue is greater than or equal to minValue
            require(leverMaxValues[k] >= leverMinValues[k], "Max val must >= min");
            // enforce that currentValue is valid
            require((leverStartValues[k] >= leverMinValues[k]) && (leverStartValues[k] <= leverMaxValues[k]), "Invalid start val");
            // add the lever to this token
            controlTokenMapping[controlTokenId].levers[k] = ControlLever(leverMinValues[k],
                leverMaxValues[k], leverStartValues[k], true);
        }
        // the control token artist can optionally specify additional collaborators on this layer
        for (uint256 i = 0; i < additionalCollaborators.length; i++) {
            // can't provide burn address as collaborator
            require(additionalCollaborators[i] != address(0));

            uniqueTokenCreators[controlTokenId].push(additionalCollaborators[i]);
        }

        emit ControlTokenInitialized(leverMinValues, leverMaxValues, leverStartValues, numAllowedUpdates);
    }

    function mintArtwork(uint256 masterTokenId, string calldata artworkTokenURI, address payable[] calldata controlTokenArtists)
        external onlyWhitelistedCreator(masterTokenId, controlTokenArtists.length) {
        // Can't mint a token with ID 0 anymore
        require(masterTokenId > 0);
        // Mint the token that represents ownership of the entire artwork    
        super._safeMint(msg.sender, masterTokenId);
        // set the token URI for this art
        super._setTokenURI(masterTokenId, artworkTokenURI);
        // track the msg.sender address as the artist address for future royalties
        uniqueTokenCreators[masterTokenId].push(msg.sender);
        // iterate through all control token URIs (1 for each control token)
        for (uint256 i = 0; i < controlTokenArtists.length; i++) {
            // can't provide burn address as artist
            require(controlTokenArtists[i] != address(0));
            // determine the tokenID for this control token
            uint256 controlTokenId = masterTokenId + i + 1;
            // add this control token artist to the unique creator list for that control token
            uniqueTokenCreators[controlTokenId].push(controlTokenArtists[i]);
            // stub in an existing control token so exists is true
            controlTokenMapping[controlTokenId] = ControlToken(0, 0, true, false);

            // Layer control tokens use the same royalty percentage as the master token
            platformRoyalties[controlTokenId] = platformRoyalties[masterTokenId];

            if (controlTokenArtists[i] != msg.sender) {
                bool containsControlTokenArtist = false;

                for (uint256 k = 0; k < uniqueTokenCreators[masterTokenId].length; k++) {
                    if (uniqueTokenCreators[masterTokenId][k] == controlTokenArtists[i]) {
                        containsControlTokenArtist = true;
                        break;
                    }
                }
                if (containsControlTokenArtist == false) {
                    uniqueTokenCreators[masterTokenId].push(controlTokenArtists[i]);
                }
            }
        }
    }

    // return the number of times that a control token can be used
    function getNumRemainingControlUpdates(uint256 controlTokenId) external view returns (int256) {
        require(controlTokenMapping[controlTokenId].exists, "Token does not exist.");

        return controlTokenMapping[controlTokenId].numRemainingUpdates;
    }

    // return the min, max, and current value of a control lever
    function getControlToken(uint256 controlTokenId) external view returns(int256[] memory) {
        require(controlTokenMapping[controlTokenId].exists, "Token does not exist.");

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

    // anyone can grant permission to another address to control a specific token on their behalf. Set to Address(0) to reset.
    function grantControlPermission(uint256 tokenId, address permissioned) external {
        permissionedControllers[msg.sender][tokenId] = permissioned;

        emit PermissionUpdated(tokenId, msg.sender, permissioned);
    }

    // Allows owner (or permissioned user) of a control token to update its lever values
    // Optionally accept a payment to increase speed of rendering priority
    function useControlToken(uint256 controlTokenId, uint256[] calldata leverIds, int256[] calldata newValues) external payable {
        // check if sender is owner/approved of token OR if they're a permissioned controller for the token owner      
        require(_isApprovedOrOwner(msg.sender, controlTokenId) || (permissionedControllers[ownerOf(controlTokenId)][controlTokenId] == msg.sender),
            "Owner or permissioned only");
        // check if control exists
        require(controlTokenMapping[controlTokenId].exists, "Token does not exist.");
        // get the control token reference
        ControlToken storage controlToken = controlTokenMapping[controlTokenId];
        // check that number of uses for control token is either infinite or is positive
        require((controlToken.numRemainingUpdates == -1) || (controlToken.numRemainingUpdates > 0), "No more updates allowed");        
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
            previousValues[i] = lever.currentValue;

            // Update token current value
            lever.currentValue = newValues[i];    
        }

        // if there's a payment then send it to the platform (for higher priority updates)
        if (msg.value > 0) {
            safeFundsTransfer(platformAddress, msg.value);
        }

        // if this control token is finite in its uses
        if (controlToken.numRemainingUpdates > 0) {
            // decrease it down by 1
            controlToken.numRemainingUpdates = controlToken.numRemainingUpdates - 1;
        }

        // emit event
        emit ControlLeverUpdated(controlTokenId, msg.value, controlToken.numRemainingUpdates, leverIds, previousValues, newValues);
    }

    // Allows a user to withdraw all failed transaction credits
    function withdrawAllFailedCredits() external {
        uint256 amount = failedTransferCredits[msg.sender];

        require(amount != 0);
        require(address(this).balance >= amount);

        failedTransferCredits[msg.sender] = 0;

        (bool successfulWithdraw, ) = msg.sender.call.value(amount)("");
        require(successfulWithdraw);
    }

    // Safely transfer funds and if fail then store that amount as credits for a later pull
    function safeFundsTransfer(address payable recipient, uint256 amount) internal {
        // attempt to send the funds to the recipient
        (bool success, ) = recipient.call.value(amount).gas(2300)("");
        // if it failed, update their credit balance so they can pull it later
        if (success == false) {
            failedTransferCredits[recipient] = failedTransferCredits[recipient].add(amount);
        }
    }

    function getFeeRecipients(uint256 id) public view returns (address payable[] memory) {
        // determine the number of fee recipients
        uint256 numRecipients = uniqueTokenCreators[id].length;
        // if the platform gets a royalty
        if (platformRoyalties[id] > 0) {
            numRecipients = numRecipients.add(1);
        }
        // prepare the array
        address payable[] memory result = new address payable[](numRecipients);

        // set the platform first if it gets a royalty
        uint256 index = 0;
        if (platformRoyalties[id] > 0) {
            result[index] = platformAddress;

            index = index.add(1);
        }
        // iterate through unique token creators and add addresses
        for (uint i = 0; i < uniqueTokenCreators[id].length; i++) {
            result[index] = uniqueTokenCreators[id][i];

            index = index.add(1);
        }
        return result;
    }

    function getFeeBps(uint256 id) public view returns (uint[] memory) {
        // Fee[] memory _fees = fees[id];
        uint256 numRecipients = uniqueTokenCreators[id].length;

        // if the platform gets a royalty
        if (platformRoyalties[id] > 0) {
            numRecipients = numRecipients.add(1);
        }

        uint[] memory result = new uint[](numRecipients);

        // set the platform's royalty first
        uint256 index = 0;
        if (platformRoyalties[id] > 0) {
            result[index] = platformRoyalties[id];

            index = index.add(1);
        }
        // iterate through unique token creators and add their split royalties
        uint256 creatorBpsEach = artistRoyalty.div(uniqueTokenCreators[id].length);
        for (uint i = 0; i < uniqueTokenCreators[id].length; i++) {
            result[index] = creatorBpsEach;

            index = index.add(1);
        }
        return result;
    }
}