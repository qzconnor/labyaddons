function changeURL(){
    var searchVal = $(`#offical-search`).val();
    var version = $(`#offical-version`).val();
    var verified = $(`#offical-only`).hasClass("checked");
    var q = "?"
    if(searchVal !== ""){
        q += `search=${searchVal}`
    }
    q += `&v=${version}`;
    q += `&verified=${verified}`;
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