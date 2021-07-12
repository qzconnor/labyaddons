require('dotenv').config();

const SERVER_PORT = process.env.SERVER_PORT | 3000;

const express = require('express');
const exphbs = require("express-handlebars");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

const passport = require("passport")
const session = require("express-session")
const MongoStore = require("connect-mongo");
const GitHubStrategy = require("passport-github2").Strategy


const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL;


passport.serializeUser(function(user, done) {
    done(null, user)
})
passport.deserializeUser(function(obj, done) {
    done(null, obj)
})

mongoose.connect('mongodb://localhost/labyaddons', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});


passport.use(
new GitHubStrategy(
    {
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: GITHUB_CALLBACK_URL
    },
    function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    console.log({ accessToken, refreshToken, profile })
    

    

    // an example of how you might save a user
    // new User({ username: profile.username }).fetch().then(user => {
    //   if (!user) {
    //     user = User.forge({ username: profile.username })
    //   }
    // 
    //   user.save({ profile: profile, access_token: accessToken }).then(() => {
    //     return done(null, user)
    //   })
    // })
        return done(null, profile)
    }
)
)
//var AccessToken = require('./models/AccessToken')

app.use(bodyParser.json());
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use('/static', express.static('public'));
app.use(bodyParser.urlencoded({extended: true})); 


app.use(
    session({ 
        secret: "%1(mBk3E9^JW8xA", 
        resave: true,
        saveUninitialized: true,
        store: MongoStore.create({ 
            mongoUrl: "mongodb://localhost/labyaddons",
            dbName: 'sessions'
        }),
        cookie: {
            secure: app.get("env") === "production",
        }
    })
  )
  app.use(passport.initialize())
  app.use(passport.session())


app.get("/", async (req, res) => {

    if(req.session.passport){
        res.render('index',{
            title: req.hostname + " - Showup",
            user: req.session.passport.user,
            photo: req.session.passport.user.photos[0].value
        });
    }else{
        res.render('index',{
            title: req.hostname + " - Showup"
        });
    }
    
   

    //console.log(data);

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


app.get("/auth/github",
    passport.authenticate("github", { scope: ["repo:status"] }), /// Note the scope here
    function(req, res) { }
)

app.get('/logout', (req, res) => {
    if (req.session) {
      req.session.destroy(err => {
        if (err) {
          res.status(400).send('Unable to log out')
        } else {
          res.send('Logout successful')
        }
      });
    }  
    res.redirect("/")
  })

app.get("/auth/github/callback",
    passport.authenticate("github", { failureRedirect: "/" }),
    function(req, res) {
      res.redirect("/")
    }
  )


app.get("/dashboard", ensureAuthenticated, (req, res) => {
    res.render('dashboard',{
        title: req.hostname + " - Dashboard"
    });
})


app.get("/api/inoffical", async (req, res) => {
    res.json({
        "addons": {
            "18": [],
            "112": [],
            "116": []
        }
    })
})
app.listen(SERVER_PORT, ()=>{
    console.log(`Server listening on port: ${SERVER_PORT}.`);
    console.log(`SITE: http://localhost:${SERVER_PORT}`);
}) 













function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
    res.redirect("/")
  }