
const messageDiv = document.getElementById('message');
function changeMessage(object){
    $('#message').fadeIn().removeClass('hidden')
    $('#message').find('#title').get(0).innerHTML= object.title
    $('#message').find('#description').get(0).innerHTML = object.description;
    $('#message').delay(3000);
    $('#message').fadeOut();
}
function share(){
    copyTextToClipboard(window.location.href)
    
    changeMessage({
        "title": '<span style="color:#55FF55">Succefully!</span>',
        "description": "Succefull copied text link to Clipboard!"
    });
}

function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
  
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
  
    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      //console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
      //console.error('Fallback: Oops, unable to copy', err);
    }
  
    document.body.removeChild(textArea);
  }
  function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
      fallbackCopyTextToClipboard(text);
      return;
    }
    navigator.clipboard.writeText(text).then(function() {
      //console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
      //console.error('Async: Could not copy text: ', err);
    });
  }