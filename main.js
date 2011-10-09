var styleElement;
var canvasElement;
var pixelMonster;

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if (request.action == "injectCss") {
		injectCss(request.css);
  } else if (request.action == "removeCss") {
		removeCss();
  } else if (request.action == "drawCanvas") {
    // drawCanvas();
	} else if (request.action == "findSong") {
		findSong();
	} else if (request.action == "createCanvas") {
  	createCanvas();
  }
});

window.addEventListener("resize", function() {
	if(canvasElement!=null) {
		canvasElement.height = Math.floor(window.innerHeight);
		canvasElement.width = Math.floor(window.innerWidth);  // assign width will clear the context
	}
  //	drawCanvas();
}, false);


function injectCss() {
  styleElement = document.createElement("style");
  styleElement.innerText = "\
    #songberg_container { \
      position: fixed; \
      top: 0; \
      right: 0; \
      width: 70px; \
      height: 0px; \
      background-color: #fff; \
      min-width: 70px; \
      max-width: 350px; \
      border-left: 1px solid #aaa; \
      z-index: 1000; \
    } \
    #songberg_container .toggle_button, #songberg_container .message { \
      margin: 10px 0 0 20px; \
      background-color: #40BBF2; \
      display: inline-block; \
      padding: 4px 10px; \
      color: white; \
      font-weight: bold; \
      text-decoration: none; \
    } \
    #songberg_container .toggle_button { \
      cursor: pointer; \
    } \
    #songberg_container pre { \
      height: 90%; \
      overflow: auto; \
      margin: 10px 20px; \
      font-family: arial, sans-serif; \
      color: #333; \
    } \
    ";
  document.documentElement.insertBefore(styleElement, null);
  
}

function removeCss(){
  styleElement.parentNode.removeChild(styleElement);
  history.go(0);
}

function findSong() {
  try {
    var title = document.getElementById('eow-title').title;
  } catch (err) {
    //console.log("no title yet");
  }
  if (typeof title === "string") {
    injectCss();
    console.log(document.URL);
    $.get("http://dev.songberg.com:3000/api/v1/songs/search?query="+escape(title)+"&video_url="+document.URL, 
        function(data) {
        var jsonData = $.parseJSON(data);
        if (jsonData.song.content == null) {
          $('body').append("\
            <div id='songberg_container'> \
              <div class='message'>no lyrics</div> \
            </div>");
        } else {
          $('body').append("<div id='songberg_container'> \
            <a class='toggle_button'>show lyrics</a> \
            <pre>"+jsonData.song.content+"</pre></div>");
        
          $('.toggle_button').toggle(
            function() {
              $(this).text('hide lyrics');
              $('#songberg_container').animate({ height: '100%', width: '25%'});
            },
            function() {
              $(this).text('show lyrics');
              $('#songberg_container').animate({ height: '0px', width: '60px'});
            }
          );
        }
      });
  }
}

