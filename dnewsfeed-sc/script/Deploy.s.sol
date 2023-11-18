// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {DNewsToken} from "../src/DNewsToken.sol";
import {NewsFeed} from "../src/NewsFeed.sol";

contract Deploy is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address owner = vm.addr(deployerPrivateKey);
        address umaProxy = 0x303c3e74b1f2500106879940e76FB56D46d16B8E;
        vm.startBroadcast(deployerPrivateKey);
        DNewsToken dnewsToken = new DNewsToken();
        dnewsToken.setUmaProxy(umaProxy);
        NewsFeed newsFeed = new NewsFeed(address(dnewsToken));
        newsFeed.setUmaProxy(umaProxy);
        vm.stopBroadcast();
    }
}
