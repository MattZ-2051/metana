// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";

contract MyToken is ERC1155URIStorage {

    constructor() ERC1155("https://gateway.pinata.cloud/ipfs/Qmb6BJT1bjo37BubRqc5uRoqRWd6u4cJREAeoaJAfZq1j3/{id}") {}

    function mintTo(address _to, uint256 _id, uint256 _amount) external {
        _mint(_to, _id, _amount, "");
    }

    function mintBatch(address _to, uint256[] memory _ids, uint256[] memory _amounts) external {
      _mintBatch(_to, _ids, _amounts, "");
    }

    function burn(address _from, uint256 _id, uint256 _amount) external {
      _burn(_from, _id, _amount);
    }

    function burnBatch(address _from, uint256[] memory _ids, uint256[] memory _amounts) external {
      _burnBatch(_from, _ids, _amounts);
    }
}
