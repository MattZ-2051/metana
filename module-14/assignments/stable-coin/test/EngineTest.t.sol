// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import {Deploy} from "../script/DeployZCoin.s.sol";
import {StableCoin} from "../src/ZCoin.sol";
import {ZEngine} from "../src/ZEngine.sol";
import {Helper} from "../script/HelperConfig.s.sol";

contract EngineTest is Test {
    Deploy deployer;
    StableCoin coin;
    ZEngine engine;
    Helper config;
    address wethUsdPriceFeed;
    address weth;

    function setUp() public {
        deployer = new Deploy();
        (coin, engine, config) = deployer.run();
        (wethUsdPriceFeed, weth,,,) = config.networkConfig();
    }

    function testGetUsdValue() public {
        uint256 amount = 15e18;
        uint256 expectedUsd = 30000e18;
        uint256 actualUsd = engine.getUsdValue(weth, amount);
        console.logUint(actualUsd);
        assertEq(expectedUsd, actualUsd);
    }
}
