const rateLimit = require("express-rate-limit");

exports.loginLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5, // max 5 login attempts
    message: "Too many login attempts. Try again later."
});
