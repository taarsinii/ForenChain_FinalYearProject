// services/blockchainService.js

require("dotenv").config();
const { ethers } = require("ethers");

// Load environment variables
const INFURA_API_KEY = process.env.INFURA_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Sepolia RPC URL
const RPC_URL = `https://sepolia.infura.io/v3/${INFURA_API_KEY}`;

// Provider (connects to Ethereum network)
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Wallet (signs transactions)
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

module.exports = {
    provider,
    wallet
};

// Temporary test
wallet.getAddress().then(address => {
    console.log("Blockchain wallet address:", address);
});