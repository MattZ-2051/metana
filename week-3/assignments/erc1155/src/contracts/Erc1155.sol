// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";

contract MyToken is ERC1155URIStorage {
    address private immutable owner;
    constructor(address _owner) ERC1155("https://gateway.pinata.cloud/ipfs/QmRf8tKk2os6XVdXK4urrRc3zfBNMEQwPPMx3FoKr6AZDQ/{id}") {
      owner = _owner;
    }

    modifier onlyOwner() {
      require(msg.sender == owner, "only forge contract can call this");
      _;
    }

    function mintTo(address _to, uint256 _id, uint256 _amount) external onlyOwner {
      require(_id <= 6, "token id not in collection");
      _mint(_to, _id, _amount, "");
    }

    function burn(address _from, uint256 _id, uint256 _amount) external onlyOwner {
      _burn(_from, _id, _amount);
    }

    function burnBatch(address _from, uint256[] memory _ids, uint256[] memory _amounts) external onlyOwner {
      _burnBatch(_from, _ids, _amounts);
    }
}

contract Forge {
    MyToken public immutable myToken;
    uint256[] public tokenIds = [0,1,2,3,4,5,6];
    mapping(address => uint256) public addressToMintTime;

    constructor() {
      myToken = new MyToken(address(this));
    }

    function mintTo(address _to, uint256 _id, uint256 _amount) external {
      require(_id <= 2, "can only mint token ids 0-2 with this function");
      if ((_id == 0 || _id == 1 || _id == 2) && addressToMintTime[msg.sender] != 0) {
        require(addressToMintTime[msg.sender] + 1 minutes <= block.timestamp, "must wait 1 minute before minting again");
      }
      myToken.mintTo(_to, _id, _amount);
      addressToMintTime[msg.sender] = block.timestamp;
    }

    function burn(address _from, uint256 _id, uint256 _amount) external {
      require(_id <= 6, "token id not in collection");
      myToken.burn(_from, _id, _amount);
    }

    function forge(uint256 _tokenId) external {
      require(_tokenId >= 3 && _tokenId <= 6, "id must be 3-6");
      uint256[] memory _amounts = new uint256[](2);
      _amounts[0] = 1;
      _amounts[1] = 1;
      if (_tokenId == 3) {
        uint256[] memory _tokenIds = new uint256[](2);
        _tokenIds[0] = 0;
        _tokenIds[1] = 1;
        myToken.burnBatch(msg.sender, _tokenIds, _amounts);
        myToken.mintTo(msg.sender, _tokenId, 1);
      }

      if (_tokenId == 4) {
        uint256[] memory _tokenIds = new uint256[](2);
        _tokenIds[0] = 1;
        _tokenIds[1] = 2;
        myToken.burnBatch(msg.sender, _tokenIds, _amounts);
        myToken.mintTo(msg.sender, _tokenId, 1);
      }

      if (_tokenId == 5) {
        uint256[] memory _tokenIds = new uint256[](2);
        _tokenIds[0] = 0;
        _tokenIds[1] = 2;
        myToken.burnBatch(msg.sender, _tokenIds, _amounts);
        myToken.mintTo(msg.sender, _tokenId, 1);
      }

      if (_tokenId == 6) {
        uint256[] memory _tokenIds = new uint256[](2);
        _tokenIds[0] = 0;
        _tokenIds[1] = 1;
        _tokenIds[2] = 2;
        myToken.burnBatch(msg.sender, _tokenIds, _amounts);
        myToken.mintTo(msg.sender, _tokenId, 1);
      }
    }

    function balanceOf(address account, uint256 id) public view virtual returns (uint256) {
      return myToken.balanceOf(account, id);
    }
}
