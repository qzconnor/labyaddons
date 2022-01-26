function changeURL(){
    const searchVal = $(`#offical-search`).val();
    const version = $(`#offical-version`).val();
    const verified = $(`#offical-only`).hasClass("checked");
    let q = "?"
    if(searchVal !== ""){
        q += `search=${searchVal}`
    }
    q += `&v=${version}`;
    q += `&verified=${verified}`;
    changeQueryString(q,undefined);
}

function changeQueryString(searchString, documentTitle){      
    documentTitle = typeof documentTitle !== 'undefined' ? documentTitle : document.title;
    const urlSplit=( window.location.href ).split( "?" );
    const obj = { Title: documentTitle, Url: urlSplit[0] + searchString };
    history.pushState(obj, obj.Title, obj.Url);      
}
function download(el){
    window.open(el.getAttribute('data-url'), "_blank");
}