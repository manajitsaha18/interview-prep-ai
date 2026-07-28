const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');


const app = express();
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const authRouter = require('./routes/auth.routes');
const interviewRouter = require('./routes/interview.routes');


app.use('/api/auth', authRouter);
app.use('/api/interview', interviewRouter);



module.exports = app;