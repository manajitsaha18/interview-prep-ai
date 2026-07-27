const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: [true, "Username already exists"],
        required: true,
        trim: true,
    },

    email: {
        type: String,
        unique: [true, "Email already exists"],
        required: true,
        lowercase: true,
        trim: true,
    },

    password: {
        type: String,
        default: null,
    },

    profilePicture: {
        type: String,
        default: "",
    },

    provider: {
        type: String,
        enum: ["local", "google"],
        default: "local",
    },
}, {
    timestamps: true,
});

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;