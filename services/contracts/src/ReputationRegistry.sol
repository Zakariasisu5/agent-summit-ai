// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ReputationRegistry
/// @notice Stores the latest AI-derived trust score for each address,
///         along with a hash + 0G Storage URI of the supporting report.
/// @dev The contract is permissionless on testnet: any address can write
///      ITS OWN score. The hash + storageURI commit the off-chain report so
///      a verifier can independently re-derive the score from the source data.
contract ReputationRegistry {
    struct Reputation {
        uint16 score;        // 0..1000 (basis-point style, 3 digits of precision)
        uint256 updatedAt;
        bytes32 reportHash;  // keccak256 of the canonical JSON report
        string storageURI;   // 0G Storage root URI (e.g. 0g://<root>)
    }

    mapping(address => Reputation) private _reputations;

    event ReputationUpdated(
        address indexed user,
        uint16 trustScore,
        bytes32 reportHash,
        string storageURI
    );

    error ScoreOutOfRange();
    error NotSelf();

    /// @notice Write a new trust score for `user`.
    /// @dev On testnet, only the user themselves can update their own score.
    ///      A future version can gate this on an attested oracle.
    function updateReputation(
        address user,
        uint16 trustScore,
        bytes32 reportHash,
        string calldata storageURI
    ) external {
        if (msg.sender != user) revert NotSelf();
        if (trustScore > 1000) revert ScoreOutOfRange();

        _reputations[user] = Reputation({
            score: trustScore,
            updatedAt: block.timestamp,
            reportHash: reportHash,
            storageURI: storageURI
        });

        emit ReputationUpdated(user, trustScore, reportHash, storageURI);
    }

    function getTrustScore(address user)
        external
        view
        returns (uint16 score, uint256 updatedAt, bytes32 reportHash, string memory storageURI)
    {
        Reputation storage r = _reputations[user];
        return (r.score, r.updatedAt, r.reportHash, r.storageURI);
    }
}
