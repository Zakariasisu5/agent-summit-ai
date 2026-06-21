const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CredLayer Contracts", function () {
  let identityRegistry, reputationRegistry, credentialRegistry;
  let owner, oracle, user1, user2;

  beforeEach(async function () {
    [owner, oracle, user1, user2] = await ethers.getSigners();

    // Deploy contracts
    const Identity = await ethers.getContractFactory("IdentityRegistry");
    identityRegistry = await Identity.deploy();

    const Reputation = await ethers.getContractFactory("ReputationRegistry");
    reputationRegistry = await Reputation.deploy(oracle.address);

    const Credential = await ethers.getContractFactory("CredentialRegistry");
    credentialRegistry = await Credential.deploy();
  });

  describe("IdentityRegistry", function () {
    it("Should create an identity", async function () {
      const metadataURI = "ipfs://QmTest123";
      
      await expect(identityRegistry.connect(user1).createIdentity(metadataURI))
        .to.emit(identityRegistry, "IdentityCreated")
        .withArgs(user1.address, metadataURI);

      const [exists, uri, timestamp] = await identityRegistry.getIdentity(user1.address);
      expect(exists).to.be.true;
      expect(uri).to.equal(metadataURI);
      expect(timestamp).to.be.gt(0);
    });

    it("Should not allow duplicate identity creation", async function () {
      await identityRegistry.connect(user1).createIdentity("ipfs://first");
      
      await expect(
        identityRegistry.connect(user1).createIdentity("ipfs://second")
      ).to.be.revertedWith("Identity already exists");
    });

    it("Should return false for non-existent identity", async function () {
      const [exists] = await identityRegistry.getIdentity(user2.address);
      expect(exists).to.be.false;
    });
  });

  describe("ReputationRegistry", function () {
    const trustScore = 850;
    const reportHash = ethers.id("test-report");
    const storageURI = "0g://0xabc123...";

    it("Should allow oracle to update reputation", async function () {
      await expect(
        reputationRegistry.connect(oracle).updateReputation(
          user1.address,
          trustScore,
          reportHash,
          storageURI
        )
      )
        .to.emit(reputationRegistry, "ReputationUpdated")
        .withArgs(user1.address, trustScore, reportHash, storageURI);

      const [score, updatedAt, hash, uri] = await reputationRegistry.getTrustScore(user1.address);
      expect(score).to.equal(trustScore);
      expect(updatedAt).to.be.gt(0);
      expect(hash).to.equal(reportHash);
      expect(uri).to.equal(storageURI);
    });

    it("Should not allow non-oracle to update reputation", async function () {
      await expect(
        reputationRegistry.connect(user1).updateReputation(
          user2.address,
          trustScore,
          reportHash,
          storageURI
        )
      ).to.be.revertedWith("Only oracle can update reputation");
    });

    it("Should return zero score for address without reputation", async function () {
      const [score] = await reputationRegistry.getTrustScore(user2.address);
      expect(score).to.equal(0);
    });

    it("Should allow updating existing reputation", async function () {
      // First update
      await reputationRegistry.connect(oracle).updateReputation(
        user1.address,
        700,
        reportHash,
        storageURI
      );

      // Second update
      const newScore = 900;
      const newHash = ethers.id("updated-report");
      await reputationRegistry.connect(oracle).updateReputation(
        user1.address,
        newScore,
        newHash,
        "0g://updated"
      );

      const [score, , hash] = await reputationRegistry.getTrustScore(user1.address);
      expect(score).to.equal(newScore);
      expect(hash).to.equal(newHash);
    });
  });

  describe("CredentialRegistry", function () {
    const credentialHash = ethers.id("test-credential");
    const storageURI = "0g://credential123";

    it("Should register a credential", async function () {
      await expect(
        credentialRegistry.connect(user1).registerCredential(credentialHash, storageURI)
      )
        .to.emit(credentialRegistry, "CredentialRegistered")
        .withArgs(user1.address, credentialHash, storageURI);

      const count = await credentialRegistry.credentialCount(user1.address);
      expect(count).to.equal(1);
    });

    it("Should verify registered credential", async function () {
      await credentialRegistry.connect(user1).registerCredential(credentialHash, storageURI);
      
      const verified = await credentialRegistry.verifyCredential(user1.address, credentialHash);
      expect(verified).to.be.true;
    });

    it("Should not verify unregistered credential", async function () {
      const verified = await credentialRegistry.verifyCredential(
        user1.address,
        ethers.id("nonexistent")
      );
      expect(verified).to.be.false;
    });

    it("Should retrieve credential by index", async function () {
      await credentialRegistry.connect(user1).registerCredential(credentialHash, storageURI);
      
      const [hash, uri, timestamp] = await credentialRegistry.getCredential(user1.address, 0);
      expect(hash).to.equal(credentialHash);
      expect(uri).to.equal(storageURI);
      expect(timestamp).to.be.gt(0);
    });

    it("Should allow multiple credentials per user", async function () {
      const hash1 = ethers.id("cred1");
      const hash2 = ethers.id("cred2");
      
      await credentialRegistry.connect(user1).registerCredential(hash1, "0g://cred1");
      await credentialRegistry.connect(user1).registerCredential(hash2, "0g://cred2");
      
      const count = await credentialRegistry.credentialCount(user1.address);
      expect(count).to.equal(2);
      
      const verified1 = await credentialRegistry.verifyCredential(user1.address, hash1);
      const verified2 = await credentialRegistry.verifyCredential(user1.address, hash2);
      expect(verified1).to.be.true;
      expect(verified2).to.be.true;
    });

    it("Should revert when accessing invalid credential index", async function () {
      await expect(
        credentialRegistry.getCredential(user1.address, 0)
      ).to.be.revertedWith("Credential index out of bounds");
    });
  });
});
