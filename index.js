require('dotenv').config();

const SERVER_PORT = process.env.SERVER_PORT | 3000;

const express = require('express');
const exphbs = require("express-handlebars");
const app = express();
const bodyParser = require("body-parser");
const passport = require("passport")
const session = require("express-session")
const MySQLStore = require('express-mysql-session')(session);
const GitHubStrategy = require("passport-github2").Strategy

var mysql = require('mysql');
const f = require('session-file-store');

const options = {
    host:  process.env.DBHOST,
    port: process.env.PORT,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database:  process.env.DATABASE
}

const connection = mysql.createConnection(options);
let connectionSuccess = false;
connection.connect(function(err) {
    if (err) {
      connectionSuccess = false;
      return;
    }
    connectionSuccess = true;
});

const TABS = [
    {
        text: 'Dashboard',
        link: 'dashboard',
        allowed: []
    },
    {
        text: 'Team',
        link: 'team',
        allowed: [50, 100]
    },
    {
        text: 'Admin',
        link: 'admin',
        allowed: [100]
    }
]

const maintenance = {
    "state": false,
    "allowedIps": []
}
const loginBtn = false;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL;

passport.serializeUser(function(user, done) {
    done(null, user)
})
passport.deserializeUser(function(obj, done) {
    done(null, obj)
})

passport.use(
new GitHubStrategy({
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: GITHUB_CALLBACK_URL
    },(accessToken, refreshToken, profile, done)=> {
        return done(null, profile)
    })
)

app.use(bodyParser.json());
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use('/static', express.static('public'));
app.use(bodyParser.urlencoded({extended: true})); 

app.use(
    session({ 
        secret: "%1(mBk3E9^JW8xA", 
        resave: false,
        saveUninitialized: false,
        store: new MySQLStore(options),
        cookie: {
            secure: app.get("env") === "production",
        }
    })
  )
  app.use(passport.initialize())
  app.use(passport.session())

  app.use((req, res, next) => {
    if(maintenance.state && req.hostname != "localhost"){
        let ip = (req.headers['x-forwarded-for'] || '').split(',')[0];
        if(!maintenance.allowedIps.includes(ip)){
            res.render('maintenance',{
                title: req.hostname + " - Maintenance",
                requestIP: ip
            })
        }
        next();
       
    }
    if(connectionSuccess && req.session.passport){
        var githubID = req.session.passport.user.id;
        connection.query("SELECT * FROM `team` WHERE githubID = " + githubID, (error, results, fields) => { // 46536197
            if (error){
                console.error(error)
            };
            var rank = 1;
            var rankName = ""
            if(results.length > 0){
                rank = results[0].rank;
                rankName = results[0].teamStatus;
            }
            if(req.session){
                req.session.rank = rank;
                req.session.rankName = rankName;
            }
           
        })
    }
    next();
  });


app.get("/", async (req, res) => {
    if(req.session.passport){
        res.render('index',{
            title: req.hostname + " - Showup",
            user: req.session.passport.user,
            photo: req.session.passport.user.photos[0].value,
            tabs: proccessTabs(TABS,req.session.rank),
            loginBtn: loginBtn
        });
    }else{
        res.render('index',{
            title: req.hostname + " - Showup"
        });
    }

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



app.get("/auth/github",passport.authenticate("github", { scope: ["repo"] }), /// Note the scope here
    function(req, res) { }
)

app.get('/logout', (req, res) => {
    if (req.session) {
      req.session.destroy(err => {
        if (err) {
          res.status(400).send('Unable to log out')
        }
      });
    }  
    res.redirect("/")
  })

app.get("/auth/github/callback",

    passport.authenticate("github", { failureRedirect: "/" }),
    function(req, res) {
        var githubID = req.session.passport.user.id;
        var username = req.session.passport.user.username;
        var user = { 
            githubID: githubID,
            rank: 1,
            githubName: username,
            profileImageUrl: req.session.passport.user.photos[0].value
        }
        if(connectionSuccess){
            connection.query(`INSERT IGNORE INTO team SET ?`,user , (error, results, fields) => {
                if (error) {
                    console.error(error)
                };
            });
        }
       
        res.redirect("/")
    }
  )

app.get("/team", ensureAuthenticated, (req, res) => {
    if(req.session.passport){
        res.render('team',{
            title: req.hostname + " - Team",
            user: req.session.passport.user,
            photo: req.session.passport.user.photos[0].value,
            tabs: proccessTabs(TABS,req.session.rank)
        });
    }else{
        res.render('team',{
            title: req.hostname + " - Team"
        });
    }
});
app.get("/admin", ensureAuthenticated, (req, res) => {
    if(req.session.passport){
        res.render('admin',{
            title: req.hostname + " - Admin",
            user: req.session.passport.user,
            photo: req.session.passport.user.photos[0].value,
            tabs: proccessTabs(TABS,req.session.rank)
        });
    }else{
        res.render('admin',{
            title: req.hostname + " - Admin"
        });
    }
});

app.get("/api/users", (req, res) => {
    var session = req.session;
   if(session && session.rank === 100){
    var users = [];

    if(connectionSuccess){
        connection.query("SELECT * FROM `team`", (error, results, fields) => { // 46536197
            if (error){
                console.error(error)
            };
            for(var result of results){
                users.push(result);
            }
            res.status(200).send({
                "status": 200,
                "data": users
           })
        });
    }



     
   }else{
    res.status(403).send({
        "status": 403,
        "message": "No Perms"
    })
   }
});


app.get("/dashboard", ensureAuthenticated, (req, res) => {
    if(req.session.passport){
        res.render('dashboard',{
            title: req.hostname + " - Dashboard",
            user: req.session.passport.user,
            photo: req.session.passport.user.photos[0].value,
            tabs: proccessTabs(TABS,req.session.rank)
        });
    }else{
        res.render('dashboard',{
            title: req.hostname + " - Dashboard"
        });
    }
})



app.get("/api/inoffical", async (req, res) => {
    if(connectionSuccess){
        connection.query("SELECT * FROM inoffical", function (err, result) {
            if (err) throw err;
            var addons = {
                "18": [],
                "112": [],
                "116": []
            }
            for(var addon of result){
                addons[addon.version + ''].push({
                    "name": addon.name,
                    "uuid": addon.uuid,
                    "uploadedAt": addon.uploadedAt,
                    "status": addon.status,
                    "author": addon.author,
                    "description": addon.description,
                    "dl": addon.dl,
                    "verified": false
                })
            }
            res.json({
                "addons": {
                    "18": addons['18'],
                    "112": addons['112'],
                    "116": addons['116']
                }
            })
        });
    }
})
app.get("/api/offical", async (req, res) => {
    var addons = {
        "18": [],
        "112": [],
        "116": []
    }
    var result = require('./public/addons.json')
    for(var key of Object.keys(result.addons)){
        var addon = result.addons[key]
        for(var a of addon){
            addons[key].push({
                "name": a.name,
                "uuid": a.uuid,
                "author": a.author,
                "description": a.description,
                "dl": `https://dl.labymod.net/latest/addons/${a.uuid}/icon.png`,
                "verified": a.verified
            })
        }
    }
    res.status(200).json({
        "time": result.time,
        "addons": {
            "18": addons['18'],
            "112": addons['112'],
            "116": addons['116']
        }
    })
})

app.get('*',function(req,res){
    res.redirect('/');
});

app.listen(SERVER_PORT, ()=>{
    console.log(`Server listening on port: ${SERVER_PORT}.`);
    console.log(`SITE: http://localhost:${SERVER_PORT}`);
}) 










function ensureAuthenticated(req, res, next) {
    var path = req.originalUrl.replace("/", "");
    var allowed = isAllowed(path, req.session.rank);
    if (req.isAuthenticated() && allowed) {
      return next()
    }

    res.redirect("/")
  }
function isAllowed(tab, rank){
    var allowed = false;
    for(var t of TABS){
        if(t.link === tab){
            if(t.allowed.length > 0){
                if(t.allowed.includes(rank)){
                    allowed = true;
                }
            }else{
                allowed = true;
            }
        }
    }
    return allowed;
}

function proccessTabs(tabs, rank){
    var visableTABS = [];
    for(var tab of tabs){
        if(tab.allowed.length > 0){
            if(tab.allowed.includes(rank)){
                visableTABS.push(tab)
            }
        }else{
              visableTABS.push(tab)
        }

    }
    return visableTABS;
}