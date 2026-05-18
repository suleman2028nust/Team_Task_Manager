// Route protection middleware
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'You need to be logged in to access this' });
};

module.exports = { isAuthenticated };
