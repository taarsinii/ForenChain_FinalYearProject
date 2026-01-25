const contract = require("./blockchain"); // your ethers contract instance

/**
 * Logs custody action to blockchain
 * @param {number} evidenceId
 * @param {string} action
 * @returns {string|null} txHash
 */
async function logBlockchainEvent(evidenceId, action) {
    try {
        const tx = await contract.logEvent(evidenceId, action);
        await tx.wait(); // wait until mined
        return tx.hash;
    } catch (err) {
        console.error("Blockchain logging failed:", err.message);
        return null; // system should still continue even if blockchain fails
    }
}

module.exports = { logBlockchainEvent };
