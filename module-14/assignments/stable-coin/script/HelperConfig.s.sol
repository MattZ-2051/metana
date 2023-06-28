// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.18;

import {Script} from "forge-std/Script.sol";
import {MockV3Aggregator} from "../test/mocks/MockV3Aggregator.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/ERC20Mock.sol";

// WBTC GOERLI - 0x1F17b8C217834c16D31357EcaB41bdD45A77741B
// WETH GOERLI - 0x2E059df728ACb159F4A4547aBCAD3b369CF65926

contract Helper is Script {
    struct NetworkConfig {
        address ethUsdPriceFeed;
        address btcUsdPriceFeed;
        address weth;
        address wbtc;
        uint256 deployerKey;
    }

    uint8 public constant DECIMALS = 8;
    int256 public constant ETH_USD_PRICE_FEED = 2000e8;
    int256 public constant BTC_USD_PRICE_FEED = 1000e8;
    uint256 private DEFAULT_ANVIL_KEY = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;

    NetworkConfig public networkConfig;

    constructor() {
        if (block.chainid == 5) {
            networkConfig = getGoerliConfig();
        } else {
            networkConfig = getAnvilConfig();
        }
    }

    function getGoerliConfig() public view returns (NetworkConfig memory) {
        return NetworkConfig({
            ethUsdPriceFeed: 0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e,
            btcUsdPriceFeed: 0xA39434A63A52E749F02807ae27335515BA4b07F7,
            weth: 0x1F17b8C217834c16D31357EcaB41bdD45A77741B,
            wbtc: 0x2E059df728ACb159F4A4547aBCAD3b369CF65926,
            deployerKey: vm.envUint("PRIVATE_KEY")
        });
    }

    function getAnvilConfig() public returns (NetworkConfig memory) {
        if (networkConfig.ethUsdPriceFeed != address(0)) {
            return networkConfig;
        }

        vm.startBroadcast();
        MockV3Aggregator ethUsdPriceFeed = new MockV3Aggregator(DECIMALS, ETH_USD_PRICE_FEED);
        ERC20Mock wethMock = new ERC20Mock();
        MockV3Aggregator btcUsdPriceFeed = new MockV3Aggregator(DECIMALS, BTC_USD_PRICE_FEED);
        ERC20Mock wbtcMock = new ERC20Mock();
        wbtcMock.mint(msg.sender, 100e8);
        vm.stopBroadcast();

        return NetworkConfig({
            ethUsdPriceFeed: address(ethUsdPriceFeed),
            btcUsdPriceFeed: address(btcUsdPriceFeed),
            weth: address(wethMock),
            wbtc: address(wbtcMock),
            deployerKey: DEFAULT_ANVIL_KEY
        });
    }
}
