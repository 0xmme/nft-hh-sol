// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BasicNft is ERC721 {
    uint256 internal s_tokenCount;
    string public constant TOKEN_URI =
        "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";

    constructor() ERC721("Dogie", "DOG") {
        s_tokenCount = 0;
    }

    function mintNft() public returns (uint256) {
        _safeMint(msg.sender, s_tokenCount);
        s_tokenCount++;
        return s_tokenCount;
    }

    function tokenURI(uint256) public pure override returns (string memory) {
        return TOKEN_URI;
    }

    function getTokenCount() public view returns (uint256) {
        return s_tokenCount;
    }
}
