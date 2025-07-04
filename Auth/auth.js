const User = require("./user");
const bCrypt = require("bcryptjs");
const cleanObject = require("../utility/fieldFilter");
const jwt = require("jsonwebtoken");



exports.signUp = async (req, res) => {
    try {
        console.log("this is signup controllercode", req.body);

        const { fullName, email, password, phoneNumber, accountType ,gender} = req.body;
        console.log(accountType);
        if (!fullName || !email || !password || !phoneNumber || !accountType) {
            console.log("this is signupdbdcbidcefcbfic" )
            return res.status(400).json({ message: "All fields are requiered" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bCrypt.hash(password, 10);

        const user = ({
            userName: fullName,
            email,
            password: hashedPassword,
            phone: phoneNumber,
            accoutnType:accountType,
            gender:gender,
        });

        console.log("this is user", user)
console.log(user)
        const userData = cleanObject(user);
        const newUser = new User(userData);
        await newUser.save();
        res.status(201).json({ message: "User created successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}



exports.login = async (req, res) => {
    try {
        console.log("this is login controlercode");

        const { email, password } = req.body;
        console.log(req.body)
        if (!email || !password) {
            return res.status(400).json({ message: "all fields are required" });
        };

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "user not found" });
            ;
        }
   console.log("this is user", user)

        const isMatch = await bCrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "invalid password" });
        };

console.log(user.accoutnType)
        const token = jwt.sign({ email: user.email, id: user._id , accountType: user.accoutnType}, "helojwt", {
            expiresIn: "1d"
        });

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",

        }).json({ message: "Login successful", user: { email: user.email } });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.logout = (req, res)=>{
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: "Lax", 
  });
  res.status(200).json({ message: "Logged out successfully" });

}