require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/database");


connectDB();



app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});