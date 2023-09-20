const addonTemplate = document.getElementById("addon-template");

(function(a){
    window.isMobile = (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))
})(navigator.userAgent||navigator.vendor||window.opera);



const searchObj = {
  offical: {},
  "show-offical": {},
};

const tabs = {
  offical: {
    v: "18",
    search: "",
    onlyVerified: false,
  },
};

window.addEventListener('load', async ()=>{
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
  
    if (params.v && ["18", "112", "116"].includes(params.v)) {
      tabs["offical"].v = params.v;
      $(`#offical-version`).val(tabs["offical"].v)
    }
    if(params.verified && ['true', 'false'].includes(params.verified)){
      tabs["offical"].onlyVerified = $.parseJSON(params.verified.toLowerCase());
    }
    if(tabs["offical"].onlyVerified){
      $(`#offical-only`).addClass("checked");
    }

    await fetchAddons(tabs["offical"].v);
    if (params.search && params.search !== "") {
      const search = params.search;
      tabs["offical"].search = search;
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
        tabs["offical"].search = e.target.value;
        searchAddons(tabs["offical"].search)
        changeURL()
    })
    $(`#offical-only`).on('click', async () => {
        const checked = $(`#offical-only`).hasClass("checked");
        tabs["offical"].onlyVerified = checked;
        await fetchAddons(tabs["offical"].v);  
        searchAddons(tabs["offical"].search);
        changeURL()
    })

    function searchAddons(q) {
      if (q === "") {
        searchObj["show-offical"] = searchObj["offical"];
        drawAddons("offical-addons", searchObj["show-offical"]);
      } else {
        searchObj["show-offical"] = getAddonContains(searchObj["offical"], q);
        drawAddons("offical-addons", searchObj["show-offical"]);
      }
    }
  
    function drawAddons(where, object) {
      const w = document.getElementById(where);
      removeAllChildNodes(w);
      if (Object.keys(object).length === 0 && object.constructor === Object) {
        const ele = document.createElement("p");
        ele.setAttribute("id", "notFound");
        ele.innerHTML = "No matching addon found!";
        w.appendChild(ele);
      } else {
        for (const t in object) {
          const addon = object[t];
          w.appendChild(make(t, addon));
        }
      }
    }

    function make(name, addon) {
      const clon = addonTemplate.content.cloneNode(true);
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
  
    function getAddonContains(object, str) {
        const addonResult = {};
      for (const property in object) {
        if (
          object.hasOwnProperty(property) &&
          property.toLowerCase().toString().includes(str.toLowerCase())
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
      const data = await $.getJSON("./api/offical");
      const time = document.getElementsByClassName("lastfetch");
      for (let i = 0; i < time.length; i++) {
        time[i].innerHTML =
          "Last fetch: " +
          '<span style="color:#55FF55">' +
          format_time(data.time) +
          "</span>";
      }
      for (const entry of data.addons[version]) {
        if(tabs["offical"].onlyVerified){
          if(entry.verified) searchObj["offical"][entry.name] = setOB(entry)
        }else{
          searchObj["offical"][entry.name] = setOB(entry)
        }
         
      }
      searchObj["show-offical"] = searchObj["offical"];
      drawAddons("offical-addons", searchObj["show-offical"]);
    }

    function setOB(entry){
      return {
        url: `https://dl.labymod.net/latest/addons/${entry.uuid}/icon.png`,
        author: "by " + entry.author,
        description: entry.description,
        uuid: entry.uuid,
        offical: true,
        dl: entry.dl,
        verified: entry.verified
      };
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
    window.location = "/details/" + addonID
}



window.addEventListener("keydown",function (e) {
  if (e.keyCode === 114 || (e.ctrlKey && e.keyCode === 70)) { 
    e.preventDefault();
    $("#offical-search").focus()
  }
})