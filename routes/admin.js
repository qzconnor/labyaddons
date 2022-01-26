const router = require('express').Router()
router.use(require("../services/auth.service.js"));
const DB = require("../services/database.service.js");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

router.get('/', async (req, res) => {
    DB.query(`SELECT * from downloads`, async (err,result) => {
        const url = req.protocol + "://" + req.get("host");
        const addons = [];
        for(const addon of result){

          const name = await getNameByUUID(url, addon.uuid);
  
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
    const res = await fetch(baseURL + "/api/offical");
    const text = await res.text();
    const json = JSON.parse(text).addons;

    if (uuid) {
      let resName = undefined;
      for (const key of Object.keys(json)) {
        for (const o of json[key]) {
          if (o.uuid === uuid) {
            resName = o.name;
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