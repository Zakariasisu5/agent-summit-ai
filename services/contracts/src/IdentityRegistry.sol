// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IdentityRegistry
/// @notice One on-chain identity record per address. Stores a metadata URI
///         (typically a 0G Storage root pointing to a JSON profile).
contract IdentityRegistry {
    struct Identity {
        bool exists;
        string metadataURI;
        uint256 createdAt;
        uint256 updatedAt;
    }

    mapping(address => Identity) private _identities;

    event IdentityCreated(address indexed user, string metadataURI);
    event IdentityUpdated(address indexed user, string metadataURI);

    /// @notice Create or update the caller's identity record.
    /// @dev Idempotent — first call emits IdentityCreated, subsequent calls
    ///      emit IdentityUpdated. No admin, no fee, no allowlist.
    function createIdentity(string calldata metadataURI) external {
        Identity storage id = _identities[msg.sender];
        if (!id.exists) {
            id.exists = true;
            id.createdAt = block.timestamp;
            id.metadataURI = metadataURI;
            id.updatedAt = block.timestamp;
            emit IdentityCreated(msg.sender, metadataURI);
        } else {
            id.metadataURI = metadataURI;
            id.updatedAt = block.timestamp;
            emit IdentityUpdated(msg.sender, metadataURI);
        }
    }

    function getIdentity(address user)
        external
        view
        returns (bool exists, string memory metadataURI, uint256 createdAt)
    {
        Identity storage id = _identities[user];
        return (id.exists, id.metadataURI, id.createdAt);
    }
}
