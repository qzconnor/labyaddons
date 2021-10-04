//ICON https://dl.labymod.net/latest/addons/${UUID}/icon.png 

var addonTemplate = document.getElementById("addon-template");

(function(a){
    window.isMobile = (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))
})(navigator.userAgent||navigator.vendor||window.opera);



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
        "search": "",
        "onlyVerified": false
    },
    "inoffical": {
        "v": "18",
        "search": "",
        "onlyVerified": false
    }
}
$(window).ready(async () => { 
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

    for(var inOof of Object.keys(tabs)){
        $(`#${inOof}-version`).on('change', async (e)=>{
            await fetchAddons(e.target.value);  
            tabs[tab].v = e.target.value;
            searchAddons($(`#${tab}-search`).val());
            changeURL()
        })
        $(`#${inOof}-search`).on('input', (e) => {
            searchAddons(e.target.value)
            changeURL()
        })
        $(`#${inOof}-only`).on('change', () => {
            console.log($(this).is(':checked'))
            //await fetchAddons(e.target.value);  
            //tabs[tab].onlyVerified = e.target.value;
            //searchAddons($(`#${tab}-search`).val());
            //changeURL()
        })
    }
    
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
                if(tabs[tab].onlyVerified){
                    if(addon.verified){
                        w.appendChild(make(t,addon));
                    }
                }else {
                    w.appendChild(make(t,addon));
                }
            }
        }
        
    }

    function make(name,addon){
        var clon = addonTemplate.content.cloneNode(true);
        clon.getElementById('icon').src = addon.url
        clon.getElementById('icon').alt = name
        clon.getElementById('name').innerHTML = name;
        clon.getElementById('author').innerHTML = addon.author
        clon.getElementById('description').innerHTML = cut(addon.description, (window.isMobile ? 100 : 250))
        clon.getElementById('download').setAttribute('data-uuid', addon.uuid);
        clon.getElementById('name-wrap').setAttribute('data-verified', addon.verified)
        if(addon.offical){
            clon.getElementById('download').setAttribute('data-url', `/download?q=${addon.uuid}`);
        }else{
            clon.getElementById('download').setAttribute('data-url', addon.dl);
        }
        return clon;
    }

    function cut(str, len){
        return str.substring(0, len) + (str.length >= len ? "..." : "");
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
        //console.log(data)
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
                "dl": entry.dl,
                "verified": entry.verified
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
                "dl": entry.dl,
                "verified": entry.verified
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

function openTab(evt, nTab) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(nTab).style.display = "block";
    evt.currentTarget.className += " active";
    beforTab = tab;
    tab = nTab.replace("store_", "");

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