pragma solidity ^0.5.12;

//  functions needed from the v1 contract
contract V1Token {
    function ownerOf(uint256 tokenId) public view returns (address) {}

    function transferFrom(address from, address to, uint256 tokenId) public {}
}

//  functions needed from v2 contract
contract V2Token {
    function upgradeV1Token(uint256 tokenId, address v1TokenAddress, bool isControlToken, address to, 
        address payable[] memory uniqueTokenCreatorsForToken) public {}
}

// Copyright (C) 2020 Asynchronous Art, Inc.
// GNU General Public License v3.0

contract TokenUpgrader {
    event TokenUpgraded(
        uint256 tokenId,
        address v1TokenAddress,
        address v2TokenAddress
    );

    // the address of the v1 token
    address public v1TokenAddress;
    // the address of the v2 token
    address public v2TokenAddress;
    // the admin address of who can setup descriptors for the tokens
    address public adminAddress;

    mapping(uint256 => bool) public isTokenReadyForUpgrade;
    mapping(uint256 => bool) public isControlTokenMapping;        
    mapping(uint256 => address payable[]) public uniqueTokenCreatorMapping;

    constructor() public {
        adminAddress = msg.sender;
    }

    // modifier for only allowing the admin to call
    modifier onlyAdmin() {
        require(msg.sender == adminAddress);
        _;
    }

    function setupAddresses(address _v1TokenAddress, address _v2TokenAddress) public onlyAdmin {
        v1TokenAddress = _v1TokenAddress;
        v2TokenAddress = _v2TokenAddress;
    }

    function prepareTokenForUpgrade(uint256 tokenId, bool isControlToken, address payable[] memory uniqueTokenCreators) public onlyAdmin {
        isTokenReadyForUpgrade[tokenId] = true;

        isControlTokenMapping[tokenId] = isControlToken;

        uniqueTokenCreatorMapping[tokenId] = uniqueTokenCreators;
    }

    function upgradeTokenList(uint256[] memory tokenIds) public {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            upgradeToken(tokenIds[i]);
        }
    }

    function upgradeToken(uint256 tokenId) public {
        // token must be ready to be upgraded
        require(isTokenReadyForUpgrade[tokenId], "Token not ready for upgrade.");

        // require the caller of this function to be the token owner
        require(V1Token(v1TokenAddress).ownerOf(tokenId) == msg.sender);

        // transfer the v1 token to be owned by this contract (effectively burning it since this contract can't send it back out)
        V1Token(v1TokenAddress).transferFrom(msg.sender, address(this), tokenId);

        // call upgradeV1Token on the v2 contract -- this will mint the same token and send to the original owner
        V2Token(v2TokenAddress).upgradeV1Token(tokenId, v1TokenAddress, isControlTokenMapping[tokenId], 
            msg.sender, uniqueTokenCreatorMapping[tokenId]);

        // emit an upgrade event
        emit TokenUpgraded(tokenId, v1TokenAddress, v2TokenAddress);
    }
}