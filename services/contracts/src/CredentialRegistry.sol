// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title CredentialRegistry
/// @notice Append-only log of verifiable credentials per owner. Each entry
///         commits the credential payload by hash and points to the full
///         document on 0G Storage.
contract CredentialRegistry {
    struct Credential {
        bytes32 credentialHash;
        string storageURI;
        uint256 registeredAt;
    }

    mapping(address => Credential[]) private _credentials;
    // owner => credentialHash => present
    mapping(address => mapping(bytes32 => bool)) private _hasCredential;

    event CredentialRegistered(
        address indexed owner,
        bytes32 indexed credentialHash,
        string storageURI,
        uint256 index
    );

    error AlreadyRegistered();

    /// @notice Register a new credential for the caller.
    function registerCredential(bytes32 credentialHash, string calldata storageURI) external {
        if (_hasCredential[msg.sender][credentialHash]) revert AlreadyRegistered();

        _credentials[msg.sender].push(Credential({
            credentialHash: credentialHash,
            storageURI: storageURI,
            registeredAt: block.timestamp
        }));
        _hasCredential[msg.sender][credentialHash] = true;

        emit CredentialRegistered(
            msg.sender,
            credentialHash,
            storageURI,
            _credentials[msg.sender].length - 1
        );
    }

    /// @notice Returns true iff `owner` previously registered `credentialHash`.
    function verifyCredential(address owner, bytes32 credentialHash) external view returns (bool ok) {
        return _hasCredential[owner][credentialHash];
    }

    function getCredential(address owner, uint256 index)
        external
        view
        returns (bytes32 credentialHash, string memory storageURI, uint256 registeredAt)
    {
        Credential storage c = _credentials[owner][index];
        return (c.credentialHash, c.storageURI, c.registeredAt);
    }

    function credentialCount(address owner) external view returns (uint256 count) {
        return _credentials[owner].length;
    }
}
