// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.18;

import {Script} from "forge-std/Script.sol";
import {StableCoin} from "../src/ZCoin.sol";
import {ZEngine} from "../src/ZEngine.sol";
import {Helper} from "./HelperConfig.s.sol";

contract Deploy is Script {
    address[] public tokenAddresses;
    address[] public priceFeeds;

    function run() external returns (StableCoin, ZEngine, Helper) {
        Helper config = new Helper();
        (address wethUsdPriceFeed, address wbtcUsdPriceFeed, address weth, address wbtc, uint256 deployerKey) =
            config.networkConfig();
        tokenAddresses = [weth, wbtc];
        priceFeeds = [wethUsdPriceFeed, wbtcUsdPriceFeed];
        vm.startBroadcast(deployerKey);
        StableCoin coin = new StableCoin();
        ZEngine engine = new ZEngine(tokenAddresses, priceFeeds, address(coin));
        coin.transferOwnership(address(engine));
        vm.stopBroadcast();
        return (coin, engine, config);
    }
}
