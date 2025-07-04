const jwt = require("jsonwebtoken");

const tokenVerify = (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Token missing' });
    }
    try {
        const decoded = jwt.verify(token, "helojwt"); 
        req.user = decoded; 
        console.log(decoded)
        next();
    } catch (error) {
        return res.status(403).json({ success: false, message: 'Forbidden: Invalid token' });
    }
}

module.exports = tokenVerify;