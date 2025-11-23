// Middleware to check if user is logged in
exports.isLoggedIn = (req, res, next) => {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect("/login");
    }
};
