// Middleware to check user role
module.exports = function (requiredRole) {
    return function (req, res, next) {
        if (!req.session || !req.session.user) {
            return res.redirect("/login");
        }

        if (req.session.user.role !== requiredRole) {
            return res.status(403).send("Access denied");
        }

        next();
    };
};