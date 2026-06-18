// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title CredLayer ReputationRegistry
/// @notice Stores AI-generated trust scores anchored to wallet addresses.
contract ReputationRegistry {
    struct Reputation {
        uint16 score;        // 0..1000
        uint256 updatedAt;
        bytes32 reportHash;  // keccak of the full report stored on 0G Storage
        string storageURI;   // 0G Storage URI / root
    }

    mapping(address => Reputation) private _rep;

    address public oracle; // server signer with ZG_COMPUTE_PRIVATE_KEY

    event ReputationUpdated(
        address indexed user,
        uint16 trustScore,
        bytes32 reportHash,
        string storageURI
    );

    constructor(address _oracle) {
        oracle = _oracle;
    }

    modifier onlyOracle() {
        require(msg.sender == oracle, "not oracle");
        _;
    }

    function updateReputation(
        address user,
        uint16 trustScore,
        bytes32 reportHash,
        string calldata storageURI
    ) external onlyOracle {
        require(trustScore <= 1000, "score>1000");
        _rep[user] = Reputation(trustScore, block.timestamp, reportHash, storageURI);
        emit ReputationUpdated(user, trustScore, reportHash, storageURI);
    }

    function getTrustScore(address user)
        external
        view
        returns (uint16 score, uint256 updatedAt, bytes32 reportHash, string memory storageURI)
    {
        Reputation memory r = _rep[user];
        return (r.score, r.updatedAt, r.reportHash, r.storageURI);
    }
}
