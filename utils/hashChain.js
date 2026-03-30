const crypto = require("crypto");

exports.generateChainHash = ({
    previousHash,
    evidenceId,
    action,
    actorId,
    timestamp,
    extraData = ""
}) => {
    const data = `${previousHash || "GENESIS"}|${evidenceId}|${action}|${actorId}|${timestamp}|${extraData}`;
    return crypto.createHash("sha256").update(data).digest("hex");
};