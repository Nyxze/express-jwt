const express = require('express');
const jwt = require('jsonwebtoken');
const util = require('util');
const app = express();
const jwtSign = util.promisify(jwt.sign);
const jwtVerify = util.promisify(jwt.verify);
require('dotenv').config();
const generateToken = async (payload) => {

    return await jwtSign(payload, process.env.SECRET_KEY, {
        expiresIn: "300s"

    })

}
const checkToken = async (req, res, next) => {

    const authHeader = req.headers['authorization'];
    const token = authHeader ? authHeader.split(' ')[1] : null;

    if (token === null) {
        return res.status("401").json({ message: "No Token" })
    }
    try {
        req.user = await jwtVerify(token, process.env.SECRET_KEY);
        next();

    } catch (err) {
        res.status(403).json({ message: "Invalid Token", err });

    }
}
let user = {
    pass: "123",
    user_name: "Rene",
    login: "user",
    visits: 0
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.post('/login', async (req, res) => {

    let token = await generateToken(user);
    console.log(token);
    if (user.login === req.body.login && user.pass === req.body.pass) {

        res.status("200").json({
            user,
            token: await generateToken(user)
        })

    } else {
        res.status("401").json({ success: "Failed" })
    }

});

app.get('/secure', checkToken, async (req, res) => {

    req.user.visits +=1;
    res.status(200).json({
        message: "Done",
        user: req.user,
        token: await generateToken(req.user)
    })
})




console.log(process.env.SECRET_KEY);
app.listen('3000',
    console.log('Start Server'));