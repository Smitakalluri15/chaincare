// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IDonorBadge {
    function mintBadge(
        address donor,
        string memory ngoName,
        uint256 amount
    ) external returns (uint256);
}

contract Donation {

    struct DonationRecord {
        address donor;
        string  ngoName;
        uint256 amount;
        uint256 timestamp;
    }

    address public owner;
    DonationRecord[] public donations;
    address public badgeContract;

    mapping(string => uint256) public ngoDonations;
    mapping(address => uint256[]) public donorHistory;
    mapping(address => uint256) public donorTotals;
    address[] public donors;
    mapping(address => bool) public hasDonated;
    string[] public ngoList;
    mapping(string => bool) public validNGO;

    event DonationMade(
        address indexed donor,
        string  indexed ngoName,
        uint256 amount,
        uint256 timestamp,
        uint256 donationId
    );
    event NGOAdded(string ngoName);
    event BadgeContractUpdated(address badgeContract);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier validNGOName(string memory ngoName) {
        require(validNGO[ngoName], "Invalid NGO name");
        _;
    }

    constructor() {
        owner = msg.sender;
        _addNGO("Food Relief Fund");
        _addNGO("Education Support NGO");
        _addNGO("Animal Welfare NGO");
        _addNGO("Disaster Relief Campaign");
    }

    function donateToNGO(
        string memory ngoName,
        uint256 amount
    ) external validNGOName(ngoName) {
        require(amount > 0, "Amount must be > 0");

        uint256 donationId = donations.length;
        donations.push(DonationRecord({
            donor:     msg.sender,
            ngoName:   ngoName,
            amount:    amount,
            timestamp: block.timestamp
        }));

        ngoDonations[ngoName]   += amount;
        donorTotals[msg.sender] += amount;
        donorHistory[msg.sender].push(donationId);

        if (!hasDonated[msg.sender]) {
            hasDonated[msg.sender] = true;
            donors.push(msg.sender);
        }

        if (badgeContract != address(0)) {
            try IDonorBadge(badgeContract).mintBadge(msg.sender, ngoName, amount) {
            } catch {
            }
        }

        emit DonationMade(msg.sender, ngoName, amount, block.timestamp, donationId);
    }

    function setBadgeContract(address _badgeContract) external onlyOwner {
        badgeContract = _badgeContract;
        emit BadgeContractUpdated(_badgeContract);
    }

    function addNGO(string memory ngoName) external onlyOwner {
        _addNGO(ngoName);
    }

    function getTotalDonations() external view returns (uint256 total) {
        for (uint256 i = 0; i < ngoList.length; i++) {
            total += ngoDonations[ngoList[i]];
        }
    }

    function getDonationsByUser(address donor) external view returns (DonationRecord[] memory) {
        uint256[] memory indices = donorHistory[donor];
        DonationRecord[] memory result = new DonationRecord[](indices.length);
        for (uint256 i = 0; i < indices.length; i++) {
            result[i] = donations[indices[i]];
        }
        return result;
    }

    function getNGODonations(string memory ngoName) external view returns (uint256) {
        return ngoDonations[ngoName];
    }

    function getAllDonations() external view returns (DonationRecord[] memory) {
        return donations;
    }

    function getDonationCount() external view returns (uint256) {
        return donations.length;
    }

    function getDonorCount() external view returns (uint256) {
        return donors.length;
    }

    function getAllDonors() external view returns (address[] memory) {
        return donors;
    }

    function getNGOList() external view returns (string[] memory) {
        return ngoList;
    }

    function _addNGO(string memory ngoName) internal {
        require(!validNGO[ngoName], "NGO already exists");
        validNGO[ngoName] = true;
        ngoList.push(ngoName);
        emit NGOAdded(ngoName);
    }
}