pragma solidity ^0.5.12;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/IERC721.sol";

// interface for the v2 contract
interface IAsyncArtwork_v2 {
    function getControlToken(uint256 controlTokenId)
        external
        view
        returns (int256[] memory);
            function useControlToken(
        uint256 controlTokenId,
        uint256[] calldata leverIds,
        int256[] calldata newValues
    ) external payable;
    function ownerOf(uint256 tokenId) external view returns (address);
    function getApproved(uint256 tokenId) external view returns (address);
    // function isApprovedForAll(address owner, address operator) external view returns (bool);
    function transferFrom(address from, address to, uint256 tokenId) external;

}

// Copyright (C) 2020 Asynchronous Art, Inc.
// GNU General Public License v3.0
// Full notice https://github.com/asyncart/async-contracts/blob/master/LICENSE
contract ProxyLayer {
    IAsyncArtwork_v2 public asyncArtwork_V2;

    // struct for the controlling token
    // of the proxy layer
    struct ControllingToken {
        address tokenAddress;
        uint256 tokenId;
    }

    // mapping of the async artwork token id to the struct storing the
    // information about the token that controls this layer
    mapping(uint256 => ControllingToken) public controlledTokens;

    // an event emitted when a control layer is converted to a proxy layer
    event ConvertedToProxyLayer(
        uint256 asncArtworkV2TokenId,
        address targetTokenAddress,
        uint256 targetTokenId,
        address converter
    );

    // constructor: needs the address of the async artwork v2 contract
    constructor(address _asyncArtworkV2) public {
        asyncArtwork_V2 = IAsyncArtwork_v2(_asyncArtworkV2);
    }

    // converts a control token/layer to a proxy layer, controlled by the referenced target nft
    // note: **this is a permanent process that can NOT be reversed**!
    function permanentlyConvertToProxyLayer(uint256 _asycArtV2TokenId, address _targetTokenAddress, uint256 _targetTokenId) external {
        // msg.sender has to be the current owner of the control token
        require(asyncArtwork_V2.ownerOf(_asycArtV2TokenId) == msg.sender, "Only owner of the control token.");

        // has to be a valid control token (correctly set up)
        int256[] memory controlLevers = asyncArtwork_V2.getControlToken(_asycArtV2TokenId);
        require(controlLevers.length > 0, "Only a correctly set up control token.");

        // control token can't be a proxy layer already
        require(controlledTokens[_asycArtV2TokenId].tokenAddress == address(0), "Can only be converted once.");

        // the target token is registered as the controlling token for the layer
        controlledTokens[_asycArtV2TokenId] = ControllingToken(_targetTokenAddress, _targetTokenId);

        // the control token is transferred here
        asyncArtwork_V2.transferFrom(msg.sender, address(this), _asycArtV2TokenId);

        emit ConvertedToProxyLayer(_asycArtV2TokenId, _targetTokenAddress, _targetTokenId, msg.sender);
    }

    // this function allows the current NFT holder to control the underlying control layer within this proxy mechanism
    function useProxyLayer(uint256 _asycArtV2TokenId, uint256[] calldata leverIds, int256[] calldata newValues) external payable {
        // msg.sender has to be the owner or approved by the owner
        IERC721 token = IERC721(controlledTokens[_asycArtV2TokenId].tokenAddress);
        uint256 tokenId = controlledTokens[_asycArtV2TokenId].tokenId;
        require(token.ownerOf(tokenId) == msg.sender, "Only the NFT owner can use the proxy layer.");

        // Relay the control token function
        asyncArtwork_V2.useControlToken.value(msg.value)(_asycArtV2TokenId, leverIds, newValues);
    }    
}
