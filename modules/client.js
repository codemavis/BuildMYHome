// Postgres
// const { Pool, Client } = require('pg');
// const con = "postgres://postgres:nickky217@localhost:5432/weddingdeals";

// const client = new Client({
//     connectionString: con
// });

// client.connect();

// module.exports = client;


const { Pool, Client } = require('pg');

const pool = new Pool({
    user: "ntgbddxl",
    password: "WxB4tKTGeYkUh5xKrZ0PHJ-lItfulFYR",
    host: "arjuna.db.elephantsql.com",
    post: 5432,
    database: "ntgbddxl"
});

// const pool = new Pool({
//     user: "postgres",
//     password: "123",
//     host: "localhost",
//     post: 5432,
//     database: "build_my_home"
// });

module.exports = pool;