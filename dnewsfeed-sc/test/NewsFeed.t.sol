// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {DNewsToken} from "../src/DNewsToken.sol";
import {NewsFeed} from "../src/NewsFeed.sol";

contract CounterTest is Test {
    DNewsToken public dnewsToken;
    NewsFeed public newsFeed;

    uint256 internal ownerPk = 0xa11ce;
    uint256 internal bobPk = 0xb0b;
    uint256 internal alicePk = 0xca1;
    address payable internal owner = payable(vm.addr(ownerPk));
    address payable internal bob = payable(vm.addr(bobPk));
    address payable internal alice = payable(vm.addr(alicePk));

    function setUp() public {
        dnewsToken = new DNewsToken();
        newsFeed = new NewsFeed(address(dnewsToken));

        vm.deal(owner, 100 ether);
        vm.deal(bob,  100 ether);
        vm.deal(alice,  100 ether);

        vm.prank(alice);
        payable(address(dnewsToken)).call{value: 0.01 ether}(abi.encodeWithSignature("mint()"));

        vm.prank(bob);
        payable(address(dnewsToken)).call{value: 0.01 ether}(abi.encodeWithSignature("mint()"));
    }

    function testMintNews() public {
        vm.startPrank(alice);
        dnewsToken.approve(address(newsFeed), newsFeed.POST_COST_IN_DNEWS_TOKEN());
        newsFeed.mint("test","title");

        assertEq(newsFeed.balanceOf(alice), 1);
        assertEq(newsFeed.tokenURI(1), "ipfs://test");
    }

    function testMintTwice() public {
        vm.startPrank(alice);
        dnewsToken.approve(address(newsFeed), newsFeed.POST_COST_IN_DNEWS_TOKEN() * 2);
        newsFeed.mint("test","title");
        newsFeed.mint("test2","title");
        
        assertEq(newsFeed.balanceOf(alice), 2);
        assertEq(newsFeed.tokenURI(1), "ipfs://test");
        assertEq(newsFeed.tokenURI(2), "ipfs://test2");
    }

    function testUpvote() public {
        vm.startPrank(alice);
        dnewsToken.approve(address(newsFeed), newsFeed.POST_COST_IN_DNEWS_TOKEN());
        newsFeed.mint("test","title");

        vm.startPrank(bob);
        dnewsToken.approve(address(newsFeed), newsFeed.VOTE_COST());
        newsFeed.upvote(1);

        assertEq(newsFeed.upvotes(1), 1);
    }

    function testDownvote() public {
        vm.startPrank(alice);
        dnewsToken.approve(address(newsFeed), newsFeed.POST_COST_IN_DNEWS_TOKEN());
        newsFeed.mint("test","title");

        vm.startPrank(bob);
        dnewsToken.approve(address(newsFeed), newsFeed.VOTE_COST());
        newsFeed.downvote(1);

        assertEq(newsFeed.downvotes(1), 1);
    }


}
