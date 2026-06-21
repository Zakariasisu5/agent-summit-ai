// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title CredLayer CredentialRegistry
/// @notice Anchors credential hashes on-chain; payload lives on 0G Storage.
contract CredentialRegistry {
    struct Credential {
        bytes32 credentialHash;
        string storageURI;
        uint256 registeredAt;
    }

    mapping(address => Credential[]) private _creds;
    mapping(address => mapping(bytes32 => bool)) private _has;

    event CredentialRegistered(address indexed owner, bytes32 credentialHash, string storageURI);

    function registerCredential(bytes32 credentialHash, string calldata storageURI) external {
        require(!_has[msg.sender][credentialHash], "dup");
        _creds[msg.sender].push(Credential(credentialHash, storageURI, block.timestamp));
        _has[msg.sender][credentialHash] = true;
        emit CredentialRegistered(msg.sender, credentialHash, storageURI);
    }

    function verifyCredential(address owner, bytes32 credentialHash) external view returns (bool) {
        return _has[owner][credentialHash];
    }

    function credentialCount(address owner) external view returns (uint256) {
        return _creds[owner].length;
    }

    function getCredential(address owner, uint256 index)
        external
        view
        returns (bytes32 credentialHash, string memory storageURI, uint256 registeredAt)
    {
        Credential memory c = _creds[owner][index];
        return (c.credentialHash, c.storageURI, c.registeredAt);
    }
}
