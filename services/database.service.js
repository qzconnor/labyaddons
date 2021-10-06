const mysql = require('mysql');
const CONFIG = require("../config.json").DB;

const connection = mysql.createConnection({
    port: CONFIG.PORT,
    host: CONFIG.HOST,
    user: CONFIG.USER,
    password: CONFIG.PASSWORD,
    database: CONFIG.DATABASE
})

connection.connect(error => {
    if(error) throw error;
    console.log(`Successfully connected to the database: ${CONFIG.DATABASE}`);
})

module.exports = connection;