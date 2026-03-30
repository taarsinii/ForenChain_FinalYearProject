const contract = require("./blockchain");

/**
 * Logs custody action to blockchain
 * @param {number} evidenceId
 * @param {string} action
 * @param {string} dataHash
 * @returns {string|null} txHash
 */
async function logBlockchainEvent(evidenceId, action, dataHash) {
    try {
        const tx = await contract.logEvent(evidenceId, action, dataHash);
        await tx.wait();
        return tx.hash;
    } catch (err) {
        console.error("Blockchain logging failed:", err.message);
        return null;
    }
}

module.exports = { logBlockchainEvent };