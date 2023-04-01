// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../src/ChooseNickName.sol";

contract ChooseNickNameTest is Test {
    CaptureTheEther public target;
    NicknameChallenge public test;

    function setUp() public {
        target = new CaptureTheEther();
        test = new NicknameChallenge(address(target));
    }

    function testIsComplete() public {
        target.setNickname(
            0x7465737400000000000000000000000000000000000000000000000000000000
        );
        assertEq(test.isComplete(), true);
    }
}
