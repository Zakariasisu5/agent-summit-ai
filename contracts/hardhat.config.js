require("@nomicfoundation/hardhat-toolbox");
require("dotenv/config");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    zgGalileo: {
      url: process.env.NEXT_PUBLIC_0G_RPC_URL || "https://evmrpc-testnet.0g.ai",
      chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 16602,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      gas: 8000000,
      gasPrice: 1000000000, // 1 gwei
    },
  },
  paths: {
    sources: "./",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
