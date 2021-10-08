const CONFIG = require("./config.json");

const express = require("express");
const exphbs = require("express-handlebars");
const app = express();
const fs = require("fs");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const http = require("http");

app.use(express.json());
app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");
app.use("/static", express.static("public"));

const DB = require("./services/database.service.js");


app.use("/downloads", require("./routes/admin.js"))

app.get("/", async (req, res) => {
  res.render("index", {
    title: req.hostname + " - Showup",
  });
});

app.get("/imprint", async (req, res) => {
  res.render("imprint", {
    title: req.hostname + " - Imprint",
  });
});

app.get("/details/:uuid", async (req, res) => {
    var uuid = req.params.uuid;
    if(!uuid){
        return res.redirect("/")
    }

    DB.query(`SELECT * from downloads WHERE uuid = '${uuid}'`, async (err,result) => {
      if(err){
        return res.json(err);
      }
      
      var url = req.protocol + "://" + req.get("host");
      var addon = await getAddonByUUID(url, uuid)

      if(addon.error){
          return res.redirect("/")
      }
      if(!addon.addon){
          return res.redirect("/")
      }
      var downloads = 0;
      if(result.length > 0){
        downloads = result[0].downloads;
      }
      res.render("details", {
          layout: "details",
          title: req.hostname + " - Details",
          uuid,
          author: addon.addon.author,
          name:addon.addon.name,
          desc:addon.addon.description,
          isVerified: addon.addon.verified,
          imageURL: `https://dl.labymod.net/latest/addons/${uuid}/icon.png`,
          downloads
      });
    });

    //uuid = "d4389488-2692-436b-bc10-fce879f7441d";



});

app.get("/privacy", async (req, res) => {
  res.render("privacy", {
    title: req.hostname + " - Privacy Policy",
  });
});

app.get("/api/offical", async (req, res) => {
  var addons = {
    18: [],
    112: [],
    116: [],
  };
  let rawdata = fs.readFileSync("./public/addons.json");
  let result = JSON.parse(rawdata);

  for (var key of Object.keys(result.addons)) {
    var addon = result.addons[key];
    for (var a of addon) {
      addons[key].push({
        name: a.name,
        uuid: a.uuid,
        author: a.author,
        description: a.description,
        dl: `https://dl.labymod.net/latest/addons/${a.uuid}/icon.png`,
        verified: a.verified,
        version: key
      });
    }
  }
  res.status(200).json({
    time: result.time,
    addons: {
      18: addons["18"],
      112: addons["112"],
      116: addons["116"],
    },
  });
});
app.get("/download", async (req, res) => {
  var addonUuid = req.query.q;
  var url = req.protocol + "://" + req.get("host");
  var name = await getNameByUUID(url, addonUuid);

  if (!name.error) {

    DB.query(`SELECT * from downloads WHERE uuid = '${addonUuid}'`, (err,res) => {
      if(err){
        return console.error(err);
      }
      if(res.length > 0){
        var first = parseInt(res[0].downloads);
        DB.query(`UPDATE downloads SET downloads='${(first + 1)}' WHERE uuid='${addonUuid}'`, (err, res) => {
          if(err){
            return console.error(err);
          }
        })
      }else{
        DB.query(`INSERT INTO downloads (uuid, downloads) VALUES('${addonUuid}', 1 )`, (err , res) => {
          if(err){
            return console.error(err);
          }
        });
      }

    })
    download(
      `http://dl.labymod.net/latest/?file=${addonUuid}&a=1`,
      `./temp/${name.name}.jar`,
      (err) => {
        if (!err) {
          res.download(
            `${__dirname}/temp/${name.name}.jar`,
            `${name.name}.jar`,
            (err) => {
              if (err) {
                console.log(err);
              } else {
                fs.unlinkSync(`${__dirname}/temp/${name.name}.jar`);
              }
            }
          );
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

function download(url, dest, cb) {
  const file = fs.createWriteStream(dest);
  const request = http.get(url, (response) => {
    if (response.statusCode !== 200) {
      return cb("Response status was " + response.statusCode);
    }
    response.pipe(file);
  });
  // close() is async, call cb after close completes
  file.on("finish", () => file.close(cb));

  // check for request error too
  request.on("error", (err) => {
    fs.unlink(dest);
    return cb(err.message);
  });

  file.on("error", (err) => {
    // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    return cb(err.message);
  });
}

async function getAddonByUUID(baseURL, uuid) {
    var res = await fetch(baseURL + "/api/offical");
    var text = await res.text();
    var json = JSON.parse(text).addons;
  
    if (uuid) {
      var resAddon = undefined;
      for (var key of Object.keys(json)) {
        for (var o of json[key]) {
          if (o.uuid === uuid) {
            resAddon = o;
            continue;
          }
        }
      }
      return {
        addon: resAddon,
      };
    } else {
      return {
        error: "UUID not defined",
      };
    }
  }

async function getNameByUUID(baseURL, uuid) {
  var res = await fetch(baseURL + "/api/offical");
  var text = await res.text();
  var json = JSON.parse(text).addons;

  if (uuid) {
    var resName = undefined;
    for (var key of Object.keys(json)) {
      for (var o of json[key]) {
        if (o.uuid === uuid) {
          resName = o.name;
          continue;
        }
      }
    }
    return {
      name: resName,
    };
  } else {
    return {
      error: "UUID not defined",
    };
  }
}
app.get("*", function (req, res) {
  res.redirect("/");
});

app.listen(CONFIG.SERVER.DEVPORT, () => {
  console.log(`Server listening on port: ${CONFIG.SERVER.DEVPORT}.`);
  console.log(`SITE: http://localhost:${CONFIG.SERVER.DEVPORT}`);
});
