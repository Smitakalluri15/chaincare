// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DonorBadge
 * @notice ERC721 NFT minted to donors after a successful donation
 * @dev Uses OpenZeppelin ERC721URIStorage for per-token metadata
 */

// OpenZeppelin imports via npm URL (Remix auto-resolves these)
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract DonorBadge is ERC721URIStorage, Ownable {

    using Strings for uint256;

    // ─── State ───────────────────────────────────────────────────────────────

    uint256 private _tokenIdCounter;

    // Address of the Donation contract — only it can call mintBadge
    address public donationContract;

    // tokenId => donor address
    mapping(uint256 => address) public badgeOwner;

    // tokenId => NGO name the badge was earned for
    mapping(uint256 => string) public badgeNGO;

    // donor => list of tokenIds they own
    mapping(address => uint256[]) public donorBadges;

    // Badge tier thresholds (in wei, matching TYI_MOCK_USD decimals)
    uint256 public constant BRONZE_THRESHOLD = 10  * 1e18;  // 10 TYI
    uint256 public constant SILVER_THRESHOLD = 50  * 1e18;  // 50 TYI
    uint256 public constant GOLD_THRESHOLD   = 100 * 1e18;  // 100 TYI

    // ─── Events ──────────────────────────────────────────────────────────────

    event BadgeMinted(
        address indexed donor,
        uint256 indexed tokenId,
        string  ngoName,
        string  badgeTier
    );

    modifier onlyAuthorizedMinter() {
        require(
            msg.sender == donationContract || msg.sender == owner(),
            "Not authorized to mint"
        );
        _;
    }

    // ─── Constructor ─────────────────────────────────────────────────────────

    constructor() ERC721("ChainCare Donor Badge", "CCBADGE") Ownable(msg.sender) {}

    // ─── Admin ───────────────────────────────────────────────────────────────

    /**
     * @notice Set the Donation contract address
     * @dev Call this after deploying Donation.sol
     */
    function setDonationContract(address _donationContract) external onlyOwner {
        donationContract = _donationContract;
    }

    // ─── Mint ────────────────────────────────────────────────────────────────

    /**
     * @notice Mint an NFT badge to a donor
     * @param donor    Recipient wallet address
     * @param ngoName  NGO they donated to
     * @param amount   Donation amount (determines badge tier)
     *
     * Called by Donation.sol after a successful donation.
     * The owner can still mint manually for recovery or migration flows.
     */
    function mintBadge(
        address donor,
        string memory ngoName,
        uint256 amount
    ) external onlyAuthorizedMinter returns (uint256) {
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;

        _safeMint(donor, tokenId);

        // Determine tier and set metadata URI
        string memory tier = _getTier(amount);
        string memory uri  = _buildTokenURI(tokenId, ngoName, tier);
        _setTokenURI(tokenId, uri);

        // Store mappings
        badgeOwner[tokenId]  = donor;
        badgeNGO[tokenId]    = ngoName;
        donorBadges[donor].push(tokenId);

        emit BadgeMinted(donor, tokenId, ngoName, tier);
        return tokenId;
    }

    // ─── Read ────────────────────────────────────────────────────────────────

    /**
     * @notice All token IDs owned by a donor
     */
    function getBadgesByDonor(
        address donor
    ) external view returns (uint256[] memory) {
        return donorBadges[donor];
    }

    /**
     * @notice Total badges minted
     */
    function totalMinted() external view returns (uint256) {
        return _tokenIdCounter;
    }

    // ─── Internal helpers ────────────────────────────────────────────────────

    function _getTier(uint256 amount) internal pure returns (string memory) {
        if (amount >= GOLD_THRESHOLD)   return "Gold";
        if (amount >= SILVER_THRESHOLD) return "Silver";
        return "Bronze";
    }

    /**
     * @notice Builds an on-chain JSON metadata URI
     * @dev For hackathon: metadata is encoded as a data URI (no IPFS needed)
     */
    function _buildTokenURI(
        uint256 tokenId,
        string memory ngoName,
        string memory tier
    ) internal pure returns (string memory) {
        string memory json = string(abi.encodePacked(
            '{"name":"ChainCare Donor Badge #', tokenId.toString(), '",',
            '"description":"Thank you for donating to ', ngoName, ' via ChainCare.",',
            '"attributes":[',
                '{"trait_type":"NGO","value":"',      ngoName, '"},',
                '{"trait_type":"Tier","value":"',     tier,    '"},',
                '{"trait_type":"Platform","value":"ChainCare"}',
            ']}'
        ));

        // Base64-encode into a data URI so it works without IPFS
        return string(abi.encodePacked(
            "data:application/json;base64,",
            _base64Encode(bytes(json))
        ));
    }

    // ─── Base64 encoder (pure on-chain, no library needed) ──────────────────

    string internal constant _TABLE =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    function _base64Encode(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";

        uint256 encodedLen = 4 * ((data.length + 2) / 3);
        bytes memory result = new bytes(encodedLen);
        bytes memory table  = bytes(_TABLE);

        uint256 i = 0;
        uint256 j = 0;

        for (; i + 2 < data.length; i += 3) {
            result[j++] = table[(uint8(data[i])     >> 2) & 0x3F];
            result[j++] = table[((uint8(data[i]) & 0x03) << 4) | (uint8(data[i+1]) >> 4)];
            result[j++] = table[((uint8(data[i+1]) & 0x0F) << 2) | (uint8(data[i+2]) >> 6)];
            result[j++] = table[uint8(data[i+2]) & 0x3F];
        }

        if (i + 1 == data.length) {
            result[j++] = table[(uint8(data[i]) >> 2) & 0x3F];
            result[j++] = table[(uint8(data[i]) & 0x03) << 4];
            result[j++] = bytes1("=");
            result[j++] = bytes1("=");
        } else if (i + 2 == data.length) {
            result[j++] = table[(uint8(data[i]) >> 2) & 0x3F];
            result[j++] = table[((uint8(data[i]) & 0x03) << 4) | (uint8(data[i+1]) >> 4)];
            result[j++] = table[(uint8(data[i+1]) & 0x0F) << 2];
            result[j++] = bytes1("=");
        }

        return string(result);
    }
}
