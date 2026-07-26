const upload = require("./file.middleware");

const uploadResume = (req, res, next) => {
    upload.single("resume")(req, res, (err) => {
        if (err) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                    success: false,
                    message: "File size must be less than 3 MB.",
                });
            }

            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }

        next();
    });
};

module.exports = uploadResume;