var addonTemplate = document.getElementById("addon-template");

var searchObj = {
  offical: {},
  "show-offical": {},
};

var tabs = {
  offical: {
    v: "18",
    search: "",
    onlyVerified: false,
  },
};

window.addEventListener('load', async ()=>{
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
  
    if (params.v) {
      tabs["offical"].v = params.v;
    }
  
    await fetchAddons(tabs["offical"].v);
    console.log(searchObj);
    if (params.search && params.search !== "") {
      var search = params.search;
      console.log( $("#offical-search"))
      $("#offical-search").val(search);
      searchAddons(search);
    }
  
    $(`#offical-version`).on('change', async (e)=>{
        await fetchAddons(e.target.value);  
        tabs["offical"].v = e.target.value;
        searchAddons($(`#offical-search`).val());
        changeURL()
    })
    $(`#offical-search`).on('input', (e) => {
        searchAddons(e.target.value)
        changeURL()
    })
    $(`#offical-only`).on('change', () => {
        console.log($(this).is(':checked'))
        //await fetchAddons(e.target.value);  
        //tabs[tab].onlyVerified = e.target.value;
        //searchAddons($(`#${tab}-search`).val());
        //changeURL()
    })

    function searchAddons(q) {
      if (q === "") {
        searchObj["show-offical"] = searchObj["offical"];
        drawAddons("offical-addons", searchObj["show-offical"]);
      } else {
        searchObj["show-offical"] = getAddonsStartsWith(searchObj["offical"], q);
        drawAddons("offical-addons", searchObj["show-offical"]);
      }
    }
  
    function drawAddons(where, object) {
      var w = document.getElementById(where);
      removeAllChildNodes(w);
      if (Object.keys(object).length === 0 && object.constructor === Object) {
        var ele = document.createElement("p");
        ele.setAttribute("id", "notFound");
        ele.innerHTML = "No matching addon found!";
        w.appendChild(ele);
      } else {
        for (var t in object) {
          var addon = object[t];
          if (tabs["offical"].onlyVerified) {
            if (addon.verified) {
              w.appendChild(make(t, addon));
            }
          } else {
            w.appendChild(make(t, addon));
          }
        }
      }
    }
  
    function make(name, addon) {
      var clon = addonTemplate.content.cloneNode(true);
      clon.getElementById("icon").src = addon.url;
      clon.getElementById("icon").alt = name;
      clon.getElementById("name").innerHTML = name;
      clon.getElementById("author").innerHTML = addon.author;
      clon.getElementById("description").innerHTML = cut(addon.description, 250);
      clon.getElementById("download").setAttribute("data-uuid", addon.uuid);
     
      clon
        .getElementById("name-wrap")
        .setAttribute("data-verified", addon.verified);
      if (addon.offical) {
        clon
          .getElementById("download")
          .setAttribute("data-url", `/download?q=${addon.uuid}`);
      } else {
        clon.getElementById("download").setAttribute("data-url", addon.dl);
      }

      clon
      .getElementById("open")
      .setAttribute("onclick", `openDetails("${addon.uuid}")`);

      return clon;
    }
  
    function cut(str, len) {
      return str.substring(0, len) + (str.length >= len ? "..." : "");
    }
  
    function getAddonsStartsWith(object, str) {
      var addonResult = {};
      for (var property in object) {
        if (
          object.hasOwnProperty(property) &&
          property.toLowerCase().toString().startsWith(str.toLowerCase())
        ) {
          addonResult[property] = object[property];
        }
      }
      return addonResult;
    }
    async function fetchAddons(version) {
      searchObj["offical"] = {};
      searchObj["inoffical"] = {};
      searchObj["show-offical"] = {};
      searchObj["show-inoffical"] = {};
      var data = await $.getJSON("./api/offical");
      //console.log(data)
      var time = document.getElementsByClassName("lastfetch");
      for (var i = 0; i < time.length; i++) {
        time[i].innerHTML =
          "Last fetch: " +
          '<span style="color:#55FF55">' +
          format_time(data.time) +
          "</span>";
      }
      for (var entry of data.addons[version]) {
        searchObj["offical"][entry.name] = {
          url: `https://dl.labymod.net/latest/addons/${entry.uuid}/icon.png`,
          author: "by " + entry.author,
          description: entry.description,
          uuid: entry.uuid,
          offical: true,
          dl: entry.dl,
          verified: entry.verified,
        };
      }
      searchObj["show-offical"] = searchObj["offical"];
      drawAddons("offical-addons", searchObj["show-offical"]);
    }
});

function format_time(s) {
  const milliseconds = s * 1000;
  const dateObject = new Date(milliseconds);
  return (
    (dateObject.getHours() < 10
      ? "0" + dateObject.getHours()
      : dateObject.getHours()) +
    ":" +
    (dateObject.getMinutes() < 10
      ? "0" + dateObject.getMinutes()
      : dateObject.getMinutes())
  );
}

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}
function openDetails(addonID){
    window.open("/details/" + addonID)
}