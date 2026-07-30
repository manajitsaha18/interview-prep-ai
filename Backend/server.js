require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/database");


connectDB();



app.get("/", (req, res) => {
    res.send("Hello World!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});