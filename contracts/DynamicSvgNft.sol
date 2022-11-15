// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract DynamicSvgNft is ERC721 {
    event CreatedNFT(uint256 indexed tokenId, int256 highValue);

    uint256 private s_tokenCount;
    mapping(uint256 => int256) public s_tokenIdToHighValue;
    string private i_HighImgURI;
    string private i_LowImgURI;
    AggregatorV3Interface private immutable i_Pricefeed;

    constructor(
        string memory highSvg,
        string memory lowSvg,
        address aggregatorV3Address
    ) ERC721("SVGImageNFT", "SVG") {
        s_tokenCount = 0;
        i_HighImgURI = svgToBase64(highSvg);
        i_LowImgURI = svgToBase64(lowSvg);
        i_Pricefeed = AggregatorV3Interface(aggregatorV3Address);
    }

    function mintNft(int256 highValue) public {
        _safeMint(msg.sender, s_tokenCount);
        s_tokenIdToHighValue[s_tokenCount] = highValue;
        emit CreatedNFT(s_tokenCount, highValue);
        s_tokenCount++;
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

        (, int256 price, , , ) = i_Pricefeed.latestRoundData();

        string memory imgURI = i_LowImgURI;

        if (price > s_tokenIdToHighValue[tokenId]) {
            imgURI = i_HighImgURI;
        }

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
                            ',"image":"',
                            imgURI,
                            '"'
                        )
                    )
                )
            )
        );

        return customtokenURI;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    function getTokenCount() public view returns (uint256) {
        return s_tokenCount;
    }

    function getLowSVG() public view returns (string memory) {
        return i_LowImgURI;
    }

    function getHighSVG() public view returns (string memory) {
        return i_HighImgURI;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return i_Pricefeed;
    }
}
