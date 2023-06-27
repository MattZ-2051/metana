// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import {Deploy} from "../script/DeployZCoin.s.sol";
import {StableCoin} from "../src/ZCoin.sol";
import {ZEngine} from "../src/ZEngine.sol";
import {Helper} from "../script/HelperConfig.s.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/ERC20Mock.sol";

contract EngineTest is Test {
    Deploy deployer;
    StableCoin coin;
    ZEngine engine;
    Helper config;
    address public wethUsdPriceFeed;
    address public weth;
    address public wbtc;
    address public user = address(1);

    uint256 public constant STARTING_USER_BALANCE = 10 ether;
    uint256 public constant AMOUNT_COLLATERAL = 10 ether;

    function setUp() public {
        deployer = new Deploy();
        (coin, engine, config) = deployer.run();
        (wethUsdPriceFeed,, weth,,) = config.networkConfig();
        console.logAddress(wethUsdPriceFeed);
        vm.deal(user, STARTING_USER_BALANCE);
        // ERC20Mock(weth).mint(user, STARTING_USER_BALANCE);
        // ERC20Mock(wbtc).mint(user, STARTING_USER_BALANCE);
    }

    function testGetUsdValue() public {
        uint256 amount = 15e18;
        uint256 expectedUsd = 30000e18;
        uint256 actualUsd = engine.getUsdValue(weth, amount);
        assertEq(expectedUsd, actualUsd);
    }

    function testRevertsIfCollateralIsZero() public {
        vm.startPrank(user);
        ERC20Mock(weth).approve(address(coin), AMOUNT_COLLATERAL);
        vm.expectRevert(ZEngine.ZEngine_NeedsMoreThanZero.selector);
        engine.deposit(weth, 0);
        vm.stopPrank();
    }
}
