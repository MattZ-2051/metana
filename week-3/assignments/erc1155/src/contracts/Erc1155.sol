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

    function mintTo(address _to, uint256 _id) external onlyOwner {
      require(_id <= 6, "token id not in collection");
      _mint(_to, _id, 1, "");
    }

    function burn(address _from, uint256 _id) external onlyOwner {
      _burn(_from, _id, 1);
    }

    function burnBatch(address _from, uint256[] memory _ids, uint256[] memory _amounts) external onlyOwner {
      _burnBatch(_from, _ids, _amounts);
    }
}

contract Forge {
    MyToken public immutable myToken;
    uint256 public mintTimer = 0;

    constructor() {
      myToken = new MyToken(address(this));
    }

    function mint(uint256 _id) external {
      require(_id <= 2, "can only mint token ids 0-2 with this function");
      require(mintTimer + 1 minutes <= block.timestamp, "must wait 1 minute before minting again");
      myToken.mintTo(msg.sender, _id);
      mintTimer = block.timestamp;
    }

    function trade(uint256 _tokenToTrade, uint256 _tokenToReceive) external {
      require(_tokenToReceive <= 2, "can only trade for tokens 0 - 2");
      require(_tokenToTrade >= 0 && _tokenToTrade <= 3, "token id not in collection");
      require(_tokenToTrade != _tokenToReceive, "cannont trade for the same token");
      myToken.burn(msg.sender, _tokenToTrade);
      myToken.mintTo(msg.sender, _tokenToReceive);
    }

    function forge(uint256 _tokenId) external {
      require(_tokenId >= 3 && _tokenId <= 6, "id must be 3-6");
      if (_tokenId == 3) {
        uint256[] memory _tokenIds = new uint256[](2);
        uint256[] memory _amounts = new uint256[](2);
        _amounts[0] = 1;
        _amounts[1] = 1;
        _tokenIds[0] = 0;
        _tokenIds[1] = 1;
        myToken.burnBatch(msg.sender, _tokenIds, _amounts);
        myToken.mintTo(msg.sender, _tokenId);
      }

      if (_tokenId == 4) {
        uint256[] memory _tokenIds = new uint256[](2);
        uint256[] memory _amounts = new uint256[](2);
        _amounts[0] = 1;
        _amounts[1] = 1;
        _tokenIds[0] = 1;
        _tokenIds[1] = 2;
        myToken.burnBatch(msg.sender, _tokenIds, _amounts);
        myToken.mintTo(msg.sender, _tokenId);
      }

      if (_tokenId == 5) {
        uint256[] memory _tokenIds = new uint256[](2);
        uint256[] memory _amounts = new uint256[](2);
        _amounts[0] = 1;
        _amounts[1] = 1;
        _tokenIds[0] = 0;
        _tokenIds[1] = 2;
        myToken.burnBatch(msg.sender, _tokenIds, _amounts);
        myToken.mintTo(msg.sender, _tokenId);
      }

      if (_tokenId == 6) {
        uint256[] memory _tokenIds = new uint256[](3);
        uint256[] memory _amounts = new uint256[](3);
        _amounts[0] = 1;
        _amounts[1] = 1;
        _amounts[2] = 1;
        _tokenIds[0] = 0;
        _tokenIds[1] = 1;
        _tokenIds[2] = 2;
        myToken.burnBatch(msg.sender, _tokenIds, _amounts);
        myToken.mintTo(msg.sender, _tokenId);
      }
    }

    function balanceOf(address account, uint256 id) public view virtual returns (uint256) {
      return myToken.balanceOf(account, id);
    }
}
