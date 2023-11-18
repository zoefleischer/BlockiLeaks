// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DNewsToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY_PER_ADDRESS = 100 ether; // Assuming 'ether' unit for 18 decimal places
    uint256 public constant MINT_COST = 0.0000001 ether;
    uint256 public constant MINT_INTERVAL = 10 days;

    address public UMA_PROXY_ADDRESS;
    mapping(address => uint256) public lastMintedAt;

    modifier onlyUmaProxy() {
        require(msg.sender == UMA_PROXY_ADDRESS, "DNewsToken: Only UmaProxy can call this function");
        _;
    }
    constructor() ERC20("BlockileaksToken", "BLT") Ownable(msg.sender) {}

    function setUmaProxy(address newUmaProxyAddress) public onlyOwner {
        UMA_PROXY_ADDRESS = newUmaProxyAddress;
    }

    function mint() public payable {
        require(msg.value > MINT_COST, "DNewsToken: Must send 0.01 ETH to mint");
        require(
            balanceOf(msg.sender) + MAX_SUPPLY_PER_ADDRESS <= totalSupply() + MAX_SUPPLY_PER_ADDRESS,
            "DNewsToken: Cannot mint more than the allowed amount per address"
        );

        lastMintedAt[msg.sender] = block.timestamp;
        _mint(msg.sender, MAX_SUPPLY_PER_ADDRESS);
    }

    function award(address posterAddress) public payable onlyUmaProxy {
        _mint(posterAddress, MAX_SUPPLY_PER_ADDRESS);
    }

    // Function to withdraw ETH from contract
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "DNewsToken: No ETH balance to withdraw");
        payable(owner()).transfer(balance);
    }

}