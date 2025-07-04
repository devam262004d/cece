const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    console.log(token);
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    try {

        console.log("helo");
        const decoded = jwt.verify(token, "helojwt" );
        console.log(decoded,"heifirfvcurf")
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};
