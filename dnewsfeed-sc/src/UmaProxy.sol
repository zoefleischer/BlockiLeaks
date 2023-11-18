// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity ^0.8.16;

import "https://github.com/UMAprotocol/protocol/blob/7a93650a7494eaee83756382a18ecf11314499cf/packages/core/contracts/optimistic-oracle-v3/interfaces/OptimisticOracleV3Interface.sol";


// ***************************************
// *    Minimum Viable OOV3 Integration  *
// ***************************************

// This contract shows how to get up and running as quickly as possible with UMA's Optimistic Oracle V3.
// We make a simple data assertion about the real world and let the OOV3 arbitrate the outcome.

interface IDNewsToken {
    function award(address posterAddress) external payable;
}

contract OOV3_GettingStarted {
    IDNewsToken blockileaksToken;
    
    // Create an Optimistic Oracle V3 instance at the deployed address on Görli.
    OptimisticOracleV3Interface oov3 =
        OptimisticOracleV3Interface(0x9923D42eF695B5dd9911D05Ac944d4cAca3c4EAB);

    // Each assertion has an associated assertionID that uniquly identifies the assertion. We will store this here.
    bytes32 public assertionId;
    
    mapping(uint256 => bytes32) public tokenIdToAssertionId;

    address public owner;

    constructor () {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner allowed to call methoid");
        _;
    }

    function setBlockileaksToken(address newBlockileaksToken) public onlyOwner {
        blockileaksToken =  IDNewsToken(newBlockileaksToken);
    }

    // Assert the truth against the Optimistic Asserter. This uses the assertion with defaults method which defaults
    // all values, such as a) challenge window to 120 seconds (2 mins), b) identifier to ASSERT_TRUTH, c) bond currency
    //  to USDC and c) and default bond size to 0 (which means we dont need to worry about approvals in this example).
    function assertTruth(string memory _assertedClaim, uint256 tokenId) public  {
        bytes32 _assertionId = oov3.assertTruthWithDefaults(bytes(_assertedClaim), address(this));
        tokenIdToAssertionId[tokenId] = _assertionId;
    }

    // Settle the assertion, if it has not been disputed and it has passed the challenge window, and return the result.
    // result
    function settleAndGetAssertionResult(uint256 tokenId) public returns (bool) {
        bytes32 _assertionId = tokenIdToAssertionId[tokenId];
        bool isConfirmed = oov3.settleAndGetAssertionResult(_assertionId);
        if (isConfirmed){
            blockileaksToken.award(tx.origin);
        }
        return isConfirmed;
    }

    // Just return the assertion result. Can only be called once the assertion has been settled.
    function getAssertionResult() public view returns (bool) {
        return oov3.getAssertionResult(assertionId);
    }

    // Return the full assertion object contain all information associated with the assertion. Can be called any time.
    function getAssertion()
        public
        view
        returns (OptimisticOracleV3Interface.Assertion memory)
    {
        return oov3.getAssertion(assertionId);
    }


}