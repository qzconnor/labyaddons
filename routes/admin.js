var router = require('express').Router()
router.use(require("../services/auth.service.js"));
const DB = require("../services/database.service.js");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

router.get('/', async (req, res) => {
    DB.query(`SELECT * from downloads`, async (err,result) => {
        var url = req.protocol + "://" + req.get("host");
        var addons = [];
        for(var addon of result){
  
          var name = await getNameByUUID(url, addon.uuid);
  
            if (!name.error && name.name) {
              addons.push({
                  "uuid": addon.uuid,
                  "name": name.name,
                  "downloads": addon.downloads
              })
          }
        }
        res.render('downloads', {
          title: req.hostname + " - Downloads",
          addons
        })
    });
  })

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


module.exports = router;