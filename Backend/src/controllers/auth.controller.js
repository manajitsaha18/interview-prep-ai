const { getAuth } = require("../config/firebaseAdmin");
const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const blacklistTokenModel = require('../models/blacklist.model');


async function registerUserController(req, res) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const isUserAlreadyExists = await userModel.findOne({ $or: [{ username }, { email }] });

    if (isUserAlreadyExists) {
        return res.status(400).json({ message: 'User already exists' });
    }


    const hash = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        username,
        email,
        password: hash,
        provider: "local"
    });

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    res.cookie('token', token)


    res.status(201).json({
        message: 'User registered successfully',
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
}

async function loginUserController(req, res) {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    res.cookie('token', token);

    res.status(200).json({
        message: 'Login successful',
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
}

async function logoutUserController(req, res) {
    const token = req.cookies.token;

    if (token) {

        await blacklistTokenModel.create({ token });

        res.clearCookie('token');

        res.status(200).json({ message: 'Logout successful' });
    }
}

async function getMeController(req, res) {

    const user = await userModel.findById(req.user.id)



    res.status(200).json({
        message: "User details fetched successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })

}

async function googleLoginController(req, res) {
    console.log(process.env.GOOGLE_CLIENT_ID);
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({
                message: "ID Token is required",
            });
        }

        const decodedToken = await getAuth().verifyIdToken(idToken);

        console.log(decodedToken);
        
        const email = decodedToken.email;
        const name = decodedToken.name || decodedToken.email.split("@")[0];
        const picture = decodedToken.picture || "";

        let user = await userModel.findOne({ email });

        if (!user) {
            user = await userModel.create({
                username: name,
                email,
                password: null,
                profilePicture: picture,
                provider: "google",
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                username: user.username,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d",
            }
        );

        res.cookie("token", token);

        return res.status(200).json({
            message: "Google login successful",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                provider: user.provider,
            },
        });

    } catch (error) {
        console.error(error);

        return res.status(401).json({
            message: "Google authentication failed",
        });
    }
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController,
    googleLoginController,
};