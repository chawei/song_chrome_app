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
      color: #333; \
    } \
    #songberg_container #main { \
      margin: 18px 0 0 18px; \
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
    #songberg_container p { \
      margin: 0 10px 20px 0; \
      color: #666; \
    } \
    #songberg_container .text_field { \
      border: 1px solid #999; \
      outline: none; \
      width: 90%; \
      height: 20px; \
      line-height: 20px; \
      margin: 0 0 10px 0; \
      padding: 0 5px; \
    } \
    .hidden { \
      display: none; \
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
    $.get("http://dev.songberg.com:3000/api/v1/songs/search?query="+encodeURI(title)+"&video_url="+document.URL, 
        function(data) {
        var jsonData = $.parseJSON(data);
        if (jsonData == null || jsonData.song == null) {
          $('body').append("\
            <div id='songberg_container'> \
              <a class='toggle_button'>is this a song?</a> \
              <div id='main' class='hidden'> \
                <p>Sorry, i am not smart enough. <br> \
                Can you tell me the artist name and the title of this song? \
                So i can grab more info for you, thanks!</p> \
                <form id='request_form'> \
                  <input placeholder='Artist Name' type='text' id='input_artist_name' class='text_field'> \
                  <input placeholder='Song Title' type='text' id='input_song_title' class='text_field'> \
                  <input type='submit' value='send' class='submit_btn'> \
                </form> \
              </div> \
            </div>");
            
            $('.toggle_button').toggle(
              function() {
                $(this).text('hide');
                $('#songberg_container').animate({ height: '100%', width: '25%'});
                $('#main').removeClass('hidden');
              },
              function() {
                $(this).text('is this a song?');
                $('#songberg_container').animate({ height: '0px', width: '60px'});
                $('#main').addClass('hidden');
              }
            );
            
            $('#request_form').submit(function(){
              var title = $('#input_artist_name').val() + ' ' + $('#input_song_title').val();
              $.get("http://dev.songberg.com:3000/api/v1/songs/search?query="+encodeURI(title)+"&video_url="+document.URL, 
                function(data) {
                  var jsonData = $.parseJSON(data);
                  
                  if (jsonData && jsonData.song && jsonData.song.content != null) {
                    $('#songberg_container #main').html("<pre>"+jsonData.song.content+"</pre>");
                  } else {
                    $('#songberg_container #main').html("<p>sorry, still can't find it.</p>");
                  }
                }
              );
              return false;
            });
        } else if (jsonData.song.content == null) {
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

