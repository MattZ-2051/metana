// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.4;

contract BitWise {
    // count the number of bit set in data.  i.e. data = 7, result = 3
    function countBitSet(uint8 data) public pure returns (uint8 result) {
        for (uint i = 0; i < 8; i += 1) {
            if (((data >> i) & 1) == 1) {
                result += 1;
            }
        }
    }

    function countBitSetAsm(uint8 data) public pure returns (uint8 result) {
        assembly {
            result := 0
            for {
                let i := 0
            } lt(i, 8) {
                i := add(i, 1)
            } {
                let masked := and(shr(i, data), 1)
                result := add(result, masked)
            }
        }
    }
}

// Add following test cases for String contract:
// charAt("abcdef", 2) should return 0x6300
// charAt("", 0) should return 0x0000
// charAt("george", 10) should return 0x0000
contract String {
    function charAt(
        string memory input,
        uint index
    ) public pure returns (bytes2) {
        assembly {
            let result := mload(add(add(input, 32), index))
            result := and(
                0xff0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffff,
                result
            )
            mstore(0x40, result)
            return(0x40, 0x80)
        }
    }
}
