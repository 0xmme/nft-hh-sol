// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";

contract DynamicSvgNft is ERC721 {
    uint256 private s_tokenCount;
    string private i_HighImgURI;
    string private i_LowImgURI;

    constructor(string memory highSvg, string memory lowSvg)
        ERC721("SVGImageNFT", "SVG")
    {
        s_tokenCount = 0;
        i_HighImgURI = svgToBase64(highSvg);
        i_LowImgURI = svgToBase64(lowSvg);
    }

    function mintNft() public returns (uint256) {
        _safeMint(msg.sender, s_tokenCount);
        s_tokenCount++;
        return s_tokenCount;
    }

    function svgToBase64(string memory svg)
        public
        pure
        returns (string memory)
    {
        string memory svgBaseURI = "data:image/svg+xml;base64,";
        string memory svgBase64Encoded = Base64.encode(
            bytes(string(abi.encodePacked(svg)))
        );
        return string(abi.encodePacked(svgBaseURI, svgBase64Encoded));
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        _requireMinted(tokenId);

        string memory imgURI = "test";

        string memory customtokenURI = string(
            abi.encodePacked(
                _baseURI(),
                Base64.encode(
                    bytes(
                        abi.encodePacked(
                            '{"name":"',
                            name(),
                            '","description":"A dynamic NFT that mints a different image according to the current ETH price."',
                            ',"attributes":"[{"trait_type":"coolness","value":"100"}]"',
                            ',"image":',
                            imgURI
                        )
                    )
                )
            )
        );

        return customtokenURI;
        string memory baseURI = _baseURI();
        //return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString())) : "";
    }

    function _baseURI() internal view override returns (string memory) {
        return "data:application/json;base64,";
    }

    function getTokenCount() public view returns (uint256) {
        return s_tokenCount;
    }
}
