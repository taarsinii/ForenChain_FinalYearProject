module.exports = function (role) {
    return (req, res, next) => {
        if (!req.session.user || req.session.user.role !== role) {
            return res.status(403).send("Forbidden: Access Denied");
        }
        next();
    };
};