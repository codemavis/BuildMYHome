const dataAction = require('../modules/dataaction');
//const client = require('../modules/client');

let dataFile = 'fuser';
let logFile = 'luser';


exports.create = async (req, res) => {
    try {
        let objUser = req.body;
        console.log('objUser.password', objUser.password);
        objUser.password = await dataAction.hashStr(objUser.password);

        console.log('objUser.password', objUser.password);

        let qStr = `INSERT INTO fuser(firstname, middlename, lastname, phone, email, password) VALUES 
            ('${objUser.firstname}', '${objUser.middlename}', '${objUser.lastname}', '${objUser.phone}', 
            '${objUser.email}', '${objUser.password}') RETURNING * ;`;
        let newUser = await dataAction.executeQuery(qStr);
        res.json({ code: 'ok', message: 'User successfully saved', recordid: newUser.rows[0].recordid });
    } catch (err) {
        console.log('create error', err.message);
        res.status(500).send({ code: 'error', message: err.message });
    }
}

exports.findAll = async (req, res) => {
    try {
        let result = await dataAction.executeQuery(`SELECT * FROM fuser`);
        res.send(result.rows);
    } catch (err) {
        console.log('findAll error', err.message);
    }
}

exports.findOneByEmail = async(email) => {
    try {
        let result = await dataAction.executeQuery(`SELECT * FROM fuser WHERE email = '${email}'`);
        return await result.rows[0];
    } catch (err) {
        console.log('findOneByEmail error', err.message);
        return err.message;
    }
}