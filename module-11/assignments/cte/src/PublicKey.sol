pragma solidity ^0.4.21;

contract PublicKeyChallenge {
    address owner = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
    bool public isComplete;
    uint dummy = 0;

    function authenticate(bytes publicKey) public {
        require(address(keccak256(publicKey)) == owner);
        isComplete = true;
    }

    function dummyTx() public {
        dummy = 1;
    }
}
