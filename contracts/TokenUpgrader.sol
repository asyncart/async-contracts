pragma solidity ^0.5.12;

//  functions needed from the v1 contract
contract V1Token {
    function ownerOf(uint256 tokenId) public view returns (address) {}

    function transferFrom(address from, address to, uint256 tokenId) public {}
}

//  functions needed from v2 contract
contract V2Token {
    function upgradeV1Token(uint256 artworkTokenId, address v1Address, bool isControlToken, address to, 
        uint256 platformFirstPercentageForToken, uint256 platformSecondPercentageForToken, 
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
    V1Token public v1TokenAddress;
    // the address of the v2 token
    V2Token public v2TokenAddress;
    // the admin address of who can setup descriptors for the tokens
    address public adminAddress;

    mapping(uint256 => bool) public isTokenReadyForUpgrade;
    mapping(uint256 => bool) public isControlTokenMapping;
    mapping(uint256 => uint256) public platformFirstPercentageForToken;
    mapping(uint256 => uint256) public platformSecondPercentageForToken;
    mapping(uint256 => address payable[]) public uniqueTokenCreatorMapping;

    constructor(V1Token _v1TokenAddress) public {
        adminAddress = msg.sender;

        v1TokenAddress = _v1TokenAddress;
    }

    // modifier for only allowing the admin to call
    modifier onlyAdmin() {
        require(msg.sender == adminAddress);
        _;
    }

    function setupV2Address(V2Token _v2TokenAddress) public onlyAdmin {
        require(address(v2TokenAddress) == address(0), "V2 address has already been initialized.");
        
        v2TokenAddress = _v2TokenAddress;
    }

    function prepareTokenForUpgrade(uint256 tokenId, bool isControlToken, uint256 platformFirstSalePercentage,
        uint256 platformSecondSalePercentage, address payable[] memory uniqueTokenCreators) public onlyAdmin {
        isTokenReadyForUpgrade[tokenId] = true;

        isControlTokenMapping[tokenId] = isControlToken;

        uniqueTokenCreatorMapping[tokenId] = uniqueTokenCreators;

        platformFirstPercentageForToken[tokenId] = platformFirstSalePercentage;

        platformSecondPercentageForToken[tokenId] = platformSecondSalePercentage;
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
        require(v1TokenAddress.ownerOf(tokenId) == msg.sender, "Sender doesn't own token.");

        // transfer the v1 token to be owned by this contract (effectively burning it since this contract can't send it back out)
        v1TokenAddress.transferFrom(msg.sender, address(this), tokenId);

        // call upgradeV1Token on the v2 contract -- this will mint the same token and send to the original owner
        v2TokenAddress.upgradeV1Token(tokenId, address(v1TokenAddress), isControlTokenMapping[tokenId], 
            msg.sender, platformFirstPercentageForToken[tokenId], platformSecondPercentageForToken[tokenId],
            uniqueTokenCreatorMapping[tokenId]);

        // emit an upgrade event
        emit TokenUpgraded(tokenId, address(v1TokenAddress), address(v2TokenAddress));
    }
}