require("dotenv").config();
const { JsonRpcProvider, Wallet, Contract } = require("ethers");

// 1️⃣ Connect to Sepolia via RPC URL
const provider = new JsonRpcProvider(process.env.SEPOLIA_RPC);

// 2️⃣ Connect your wallet (private key stored in .env)
const wallet = new Wallet(process.env.PRIVATE_KEY, provider);

// 3️⃣ Contract address (from your deployment)
const contractAddress = process.env.CONTRACT_ADDRESS;

// 4️⃣ Contract ABI (from Remix)
const contractABI = [
    {
        "anonymous": false,
        "inputs": [
            { "indexed": false, "internalType": "uint256", "name": "evidenceId", "type": "uint256" },
            { "indexed": false, "internalType": "address", "name": "actor", "type": "address" },
            { "indexed": false, "internalType": "string", "name": "action", "type": "string" },
            { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "name": "EventLogged",
        "type": "event"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "", "type": "uint256" },
            { "internalType": "uint256", "name": "", "type": "uint256" }
        ],
        "name": "custodyEvents",
        "outputs": [
            { "internalType": "uint256", "name": "evidenceId", "type": "uint256" },
            { "internalType": "address", "name": "actor", "type": "address" },
            { "internalType": "string", "name": "action", "type": "string" },
            { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_evidenceId", "type": "uint256" }],
        "name": "getEvents",
        "outputs": [
            {
                "components": [
                    { "internalType": "uint256", "name": "evidenceId", "type": "uint256" },
                    { "internalType": "address", "name": "actor", "type": "address" },
                    { "internalType": "string", "name": "action", "type": "string" },
                    { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
                ],
                "internalType": "struct ChainOfCustody.CustodyEvent[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "_evidenceId", "type": "uint256" },
            { "internalType": "string", "name": "_action", "type": "string" }
        ],
        "name": "logEvent",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// 5️⃣ Create contract instance
const contract = new Contract(contractAddress, contractABI, wallet);

// 6️⃣ Export the contract for use in other files
module.exports = contract;
