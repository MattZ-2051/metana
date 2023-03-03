// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";

contract MyToken is ERC1155URIStorage {

    uint256[] public tokenIds = [0,1,2,3,4,5,6];


    mapping(address => uint256) public addressToMintTime;

    constructor() ERC1155("https://gateway.pinata.cloud/ipfs/QmRf8tKk2os6XVdXK4urrRc3zfBNMEQwPPMx3FoKr6AZDQ/{id}") {}

    modifier restrictTokenId(uint256 _id) {
      require(_id <= 6 && _id >= 0, "token id not in collection");
      _;
    }

    function mintTo(address _to, uint256 _id, uint256 _amount) external restrictTokenId(_id) {
      require(_id >= 2, "can only mint token ids 0-2 with this function");
      if (_id == 0 || _id == 1 || _id == 2 && addressToMintTime[msg.sender]) {
        require(addressToMintTime[msg.sender] <= block.timestamp + 60 seconds, "must wait 1 minute before minting again");
      }
      _mint(_to, _id, _amount, "");
      addressToMintTime[msg.sender] = block.timestamp;
    }

    function mintBatch(address _to, uint256[] memory _ids, uint256[] memory _amounts) external  {
      _mintBatch(_to, _ids, _amounts, "");
      addressToMintTime[msg.sender] = block.timestamp;
    }

    function burn(address _from, uint256 _id, uint256 _amount) external  restrictTokenId(_id){
      _burn(_from, _id, _amount);
    }

    function burnBatch(address _from, uint256[] memory _ids, uint256[] memory _amounts) external {
      _burnBatch(_from, _ids, _amounts);
    }
}
