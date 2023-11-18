// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


interface IUmaProxy {
    function assertTruth(string memory _assertedClaim, uint256 tokenId) external;
    function settleAndGetAssertionResult(uint256 tokenId) external returns (bool);
}

contract NewsFeed is ERC721Enumerable, Ownable {
    IERC20 public token;
    IUmaProxy public umaProxy;

    uint256 public constant POST_COST_IN_DNEWS_TOKEN = 0.001 ether; // Assuming 'ether' unit for 18 decimal places

    // Assuming 1 token per vote for simplicity
    uint256 public constant VOTE_COST = 0.001 ether;

    // Mapping from tokenId to the net votes count
    mapping(uint256 => uint256) public upvotes;
    mapping(uint256 => uint256) public downvotes;
    mapping(uint256 => string) public tokenIdToIPFS;
    mapping(uint256 => bytes32) public tokenIdToAssertionId;
    mapping(uint256 => uint256) public tokenIdToSettled;

    event Upvoted(uint256 indexed tokenId, address voter);
    event Downvoted(uint256 indexed tokenId, address voter);
    event PostSubmitted(uint256 indexed tokenId, string newsUri);

    constructor(address tokenAddress) ERC721("NewsFeed", "NF") Ownable(msg.sender) {
        token = IERC20(tokenAddress);
    }

    function _baseURI() internal view override returns (string memory) {
        return "ipfs://";
    }


    function _exists(uint256 tokenId) internal returns (bool){
        ownerOf(tokenId);
        return true;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return string(abi.encodePacked(_baseURI(), tokenIdToIPFS[tokenId]));
    }

    function setUmaProxy(address newUmaProxyAddress) public onlyOwner {
        umaProxy = IUmaProxy(newUmaProxyAddress);
    }

    // Upvote a news post
    function upvote(uint256 tokenId) public {
        require(_exists(tokenId), "NewsFeed: upvote for nonexistent token");
        require(token.balanceOf(msg.sender) >= VOTE_COST, "NewsFeed: not enough tokens to upvote");

        address owner = ownerOf(tokenId);
        require(owner != msg.sender, "NewsFeed: cannot vote on your own post");

        upvotes[tokenId] += 1;

        emit Upvoted(tokenId, msg.sender);
    }

    // Downvote a news post
    function downvote(uint256 tokenId) public {
        require(_exists(tokenId), "NewsFeed: downvote for nonexistent token");
        require(token.balanceOf(msg.sender) >= VOTE_COST, "NewsFeed: not enough tokens to downvote");

        address owner = ownerOf(tokenId);
        require(owner != msg.sender, "NewsFeed: cannot vote on your own post");

        // The owner of the post loses tokens if their post is downvoted
        downvotes[tokenId] += 1;

        emit Downvoted(tokenId, msg.sender);
    }

    function verify(uint256 tokenId) public {
        require(msg.sender == ownerOf(tokenId), "NewsFeed: only owner can submit for verification");
        bool isSettled = umaProxy.settleAndGetAssertionResult(tokenId);
        if (isSettled) {
            tokenIdToSettled[tokenId] = 1;
        }
    }   


    // Override this function to mint tokens
    // This should include the logic for setting the token URI to an IPFS JSON
    function mint(string memory newsIPFSCid, string memory title) public {
        require(token.balanceOf(msg.sender) > POST_COST_IN_DNEWS_TOKEN, "Not enough DNews tokens to create post");
        token.transferFrom(msg.sender, address(this), POST_COST_IN_DNEWS_TOKEN);

        // Set the tokenURI to IPFS link after minting
        uint256 nextTokenId = totalSupply() + 1;

        // Check that newsUri is an IPFS link
        tokenIdToIPFS[nextTokenId] = newsIPFSCid;

        _safeMint(msg.sender, nextTokenId);
        
        umaProxy.assertTruth(title, nextTokenId);
        emit PostSubmitted(nextTokenId, newsIPFSCid);
    }


}
