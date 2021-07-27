//ICON https://dl.labymod.net/latest/addons/${UUID}/icon.png 

var addonTemplate = document.getElementById("addon-template");

var searchObj = {
    "offical": {},
    "inoffical": {},
    "show-offical": {},
    "show-inoffical": {}
};
var tab = "offical";
var beforTab = tab;

var tabs = {
    "offical": {
        "v": "18",
        "search": ""
    },
    "inoffical": {
        "v": "18",
        "search": ""
    }
}



$(window).ready( async() => { 
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());

    if(params.tab){
        tab = params.tab;
    }
    if(params.v){
        tabs[tab].v = params.v
    }

    await fetchAddons(tabs[tab].v); 
    $(`#${tab}-version`).val(tabs[tab].v);
    document.getElementById(tab).click();
    if(params.search && params.search !== ""){
        var search = params.search;
        var realTab = document.querySelectorAll(`[data-to='${tab}']`)[0];
        var bar =  $(realTab).find('.search').get(0);
        bar.value = search;
        searchAddons(search);
    }

    $('#offical-search').on('input', (e) => {
        searchAddons(e.target.value)
        changeURL()
    })
    
    $('#inoffical-version').on('change', async (e)=>{
        await fetchAddons(e.target.value);  
        tabs[tab].v = e.target.value;
        searchAddons($(`#${tab}-search`).val());
        changeURL()
    })
    $('#offical-version').on('change', async (e)=>{
        await fetchAddons(e.target.value);  
        tabs[tab].v = e.target.value;
        searchAddons($(`#${tab}-search`).val());
        changeURL()
    })
    $('#inoffical-search').on('input', (e) => {
        searchAddons(e.target.value)
        changeURL()
    })
    
    $(".tablinks").click(async () => {
        await fetchAddons(tabs[tab].v);  
        changeURL()
    })

    function searchAddons(q){
        if(q === ""){
            searchObj["show-" + tab] = searchObj[tab];
            drawAddons(tab + "-addons",searchObj["show-" + tab]);
        }else{
            searchObj["show-" + tab] = getAddonsStartsWith(searchObj[tab],q);
            drawAddons(tab + "-addons",searchObj["show-" + tab]);
        }
    }
    function drawAddons(where,object){
        var w =  document.getElementById(where);
        removeAllChildNodes(w)
        if(Object.keys(object).length === 0 && object.constructor === Object){
            var ele = document.createElement('p');
            ele.setAttribute("id", "notFound");
            ele.innerHTML = "No matching addon found!"
            w.appendChild(ele)
        }else{
            for(var t in object){
                var addon = object[t];
                var clon = addonTemplate.content.cloneNode(true);
                clon.getElementById('icon').src = addon.url
                clon.getElementById('icon').alt = addon.t
                clon.getElementById('name').innerHTML = t;
                clon.getElementById('author').innerHTML = addon.author
                clon.getElementById('description').innerHTML = addon.description
                clon.getElementById('download').setAttribute('data-uuid', addon.uuid);
                if(addon.offical){
                    clon.getElementById('download').setAttribute('data-url', `https://dl.labymod.net/latest/?file=${addon.uuid}&a=1`);
                }else{
                    clon.getElementById('download').setAttribute('data-url', addon.dl);
                }
               
                w.appendChild(clon);
            }
        }
        
    }
    
    function getAddonsStartsWith(object, str) {
        var addonResult = {};
        for (var property in object) {
            if (object.hasOwnProperty(property) && 
               property.toLowerCase().toString().startsWith(str.toLowerCase())) {
               addonResult[property] = object[property];
            }
        }
        return addonResult
    }
    
    async function fetchAddons(version) {
        searchObj["offical"] = {};
        searchObj["inoffical"] = {};
        searchObj["show-offical"] = {};
        searchObj["show-inoffical"] = {};
        var data = await $.getJSON( "./api/offical");
        console.log(data)
        var time = document.getElementsByClassName('lastfetch');
        for(var i=0; i < time.length; i++) {
            time[i].innerHTML ="Last fetch: " + '<span style="color:#55FF55">' + format_time(data.time) + '</span>';
        }
        for(var entry of data.addons[version]){
            searchObj["offical"][entry.name] = {
                "url": `https://dl.labymod.net/latest/addons/${entry.uuid}/icon.png`,
                "author": "by " + entry.author,
                "description": entry.description,
                "uuid": entry.uuid,
                "offical": true,
                "dl": entry.dl
            }
        }
        searchObj["show-offical"] = searchObj["offical"];
        drawAddons("offical-addons", searchObj["show-offical"]);
        data = await $.getJSON( "./api/inoffical");    
        
        for(var entry of data.addons[version]){
            searchObj["inoffical"][entry.name] = {
                "url": `static/logos/${entry.uuid}.png`,
                "author": "by " + entry.author,
                "description": entry.description,
                "uuid": entry.uuid,
                "offical": false,
                "dl": entry.dl
            }
        } 
        searchObj["show-inoffical"] = searchObj["inoffical"];
        drawAddons("inoffical-addons",searchObj["show-inoffical"]);
    }

})
function format_time(s) {
    const milliseconds = s * 1000;
    const dateObject = new Date(milliseconds);
    return (dateObject.getHours() < 10 ? '0' + dateObject.getHours() : dateObject.getHours()) + ":" + (dateObject.getMinutes() < 10 ? '0' + dateObject.getMinutes() : dateObject.getMinutes());
}

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}
function openTab(evt, cityName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
    beforTab = tab;
    tab = cityName.replace("store_", "");

}    

function changeURL(){
    var searchVal = $(`#${tab}-search`).val();
    var version = $(`#${tab}-version`).val();
    var q = "?"
    if(searchVal !== ""){
        q += `search=${searchVal}`
        q += `&tab=${tab}`;
    }else{
        q += `tab=${tab}`;
    }

    q += `&v=${version}`;
    changeQueryString(q,undefined);
}
function changeQueryString(searchString, documentTitle){      
    documentTitle = typeof documentTitle !== 'undefined' ? documentTitle : document.title;      
    var urlSplit=( window.location.href ).split( "?" );      
    var obj = { Title: documentTitle, Url: urlSplit[0] + searchString };      
    history.pushState(obj, obj.Title, obj.Url);      
}

function download(el){
    window.open(el.getAttribute('data-url'), "_blank");
}

