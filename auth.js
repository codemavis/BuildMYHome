require('dotenv').config();
const client = require('./modules/client');

const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const cors = require('cors');
const crypto = require('crypto');

const dataAction = require('./modules/dataaction');
const user = require('./controllers/user.controller');


app.use(cors());
app.use(express.json());

app.post('/login', async (req, res) => {
    //Authenticate User
    const currUser = await user.findOneByEmail(req.body.email)

    if (currUser == null) return res.status(400).send({
        code: 'ERROR',
        message: 'Unauthorized access'
    });

    try {
        if (await dataAction.compareHash(req.body.password, currUser.password)) {
            //Correct Password 
            const jwtUser = {
                userid: currUser.recordid,
                firstname: currUser.firstname,
                lastname: currUser.lastname,
                email: currUser.email
            };

            const accessToken = generateAccessToken(jwtUser);
            const refreshToken = jwt.sign(jwtUser, process.env.REFRESH_TOKEN_SECRET);

            //Save Refresh Token
            let isSaved = await saveRefreshToken(jwtUser.userid, refreshToken);
            console.log('isSaved', isSaved);

            res.json({
                code: 'OK',
                message: 'Logged in successfully',
                accessToken: accessToken,
                refreshToken: refreshToken
            });
        } else
            res.json({
                code: 'ERROR',
                message: 'Unauthorized Access'
            });
    } catch (error) {
        res.status(500).send({
            code: 'ERROR',
            message: error.message
        });
    }
});


process.once('SIGUSR2', function () {

    console.log('process.pid', process.pid)
    process.kill(process.pid, 'SIGUSR2');
});

process.on('SIGINT', function () {
    // this is only called on ctrl+c, not restart
    process.kill(process.pid, 'SIGINT');
});


app.listen(4444, err => {
    if (err) return console.log("ERROR", err);
    console.log(`Listening on port ${4444}`);
});

const generateAccessToken = (currUser) => {
    return jwt.sign(currUser, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24h' }); //15s
}

app.post('/token', async (req, res) => {
    const refreshToken = req.body.token;
    if (refreshToken == null) return res.sendStatus(401);

    //Check with active refresh tokens
    let isAvailable = await checkRefreshToken(refreshToken);
    if (!isAvailable) return res.status(403).send({ code: 'ERROR', message: 'Invalid Refresh Token' });

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, currUser) => {
        if (err) return res.sendStatus(403);

        //  const accessToken = generateAccessToken({ name: user.name });
        const accessToken = generateAccessToken(currUser);
        res.json({ code: 'OK', message: 'Success', accessToken: accessToken });
    });
});

app.delete('/logout', async (req, res) => {

    try {
        let result = await client.query(`UPDATE authuser SET isactive=false WHERE refreshtoken='${req.body.token}'`);
        console.log('result', result);
        res.json({ code: 'OK', message: 'Success', logout: true });
    } catch (err) {
        console.log('logout error', err.message);
        res.json({ code: 'ERROR', message: 'Fail', logout: true });
    }


});

const checkRefreshToken = async (refreshToken) => {
    try {
        let result = await client.query(`SELECT recordid,user FROM authuser WHERE refreshtoken='${refreshToken}' AND isactive=true`);
        console.log('result.rows.rowCount', result.rows.length);
        return result.rows.length;

    } catch (err) {
        console.log('findAll error', err.message);
    }
    return null;
}

const saveRefreshToken = async (userId, refreshToken) => {
    try {
        let result = await client.query(`INSERT INTO authuser("user", refreshtoken, isactive) VALUES (${userId}, '${refreshToken}', true)`);
        console.log('result.rows', result.rows);
        return result.rows;
    } catch (err) {
        console.log('findAll error', err.message);
    }
}
