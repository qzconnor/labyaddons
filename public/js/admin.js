$(window).ready(async ()=>{
    var data = await $.getJSON( "./api/users");
    for(var user of data.data){
        console.log(user)
    }
})