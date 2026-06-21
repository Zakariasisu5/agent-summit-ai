// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title CredLayer IdentityRegistry
/// @notice Wallet-anchored identity records on 0G Chain.
contract IdentityRegistry {
    struct Identity {
        bool exists;
        string metadataURI; // 0G Storage URI / root
        uint256 createdAt;
    }

    mapping(address => Identity) private _ids;

    event IdentityCreated(address indexed user, string metadataURI);

    function createIdentity(string calldata metadataURI) external {
        require(!_ids[msg.sender].exists, "exists");
        _ids[msg.sender] = Identity(true, metadataURI, block.timestamp);
        emit IdentityCreated(msg.sender, metadataURI);
    }

    function getIdentity(address user)
        external
        view
        returns (bool exists, string memory metadataURI, uint256 createdAt)
    {
        Identity memory i = _ids[user];
        return (i.exists, i.metadataURI, i.createdAt);
    }
}
