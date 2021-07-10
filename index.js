require('dotenv').config();

const SERVER_PORT = process.env.SERVER_PORT | 3000;

const express = require('express');
const exphbs = require("express-handlebars");
const app = express();
const bodyParser = require("body-parser");
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "addons"
});

var connection = false;

con.connect(function(err) {
    if (err) throw err;
    connection = true;
});



app.use(bodyParser.json());
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use('/static', express.static('public'));
app.use(bodyParser.urlencoded({extended: true})); 


app.get("/", async (req, res) => {
    res.render('index',{
        title: req.hostname + " - Showup"
    });
})
app.get("/imprint", async (req, res) => {
    res.render('imprint',{
        title: req.hostname + " - Imprint"
    });
})
app.get("/privacy", async (req, res) => {
    res.render('privacy',{
        title: req.hostname + " - Privacy Policy"
    });
})
app.post("/api/upload", async (req, res) => {
})



app.get("/api/inoffical", async (req, res) => {
    if(connection){
        con.query("SELECT * FROM inoffical", function (err, result) {
            if (err) throw err;
            var addons18 = [];
            var addons112 = [];
            var addons116 = [];
            for(var addon of result){
                if(addon.version == 18){
                    addons18.push({
                        "name": addon.name,
                        "uuid": addon.uuid,
                        "uploadedAt": addon.uploadedAt,
                        "status": addon.status,
                        "author": addon.author,
                        "description": addon.description,
                        "dl": addon.dl
                    })
                }else if(addon.version == 112){
                    addons112.push({
                        "name": addon.name,
                        "uuid": addon.uuid,
                        "uploadedAt": addon.uploadedAt,
                        "status": addon.status,
                        "author": addon.author,
                        "description": addon.description,
                        "dl": addon.dl
                    })
                }else if(addon.version == 116){
                    addons116.push({
                        "name": addon.name,
                        "uuid": addon.uuid,
                        "uploadedAt": addon.uploadedAt,
                        "status": addon.status,
                        "author": addon.author,
                        "description": addon.description,
                        "dl": addon.dl
                    })
                }
             
            }
            res.json({
                "addons": {
                    "18": addons18,
                    "112": addons112,
                    "116": addons116
                }
            })
        });
    }
})
app.listen(SERVER_PORT, ()=>{
    console.log(`Server listening on port: ${SERVER_PORT}.`);
    console.log(`SITE: http://localhost:${SERVER_PORT}`);
}) 