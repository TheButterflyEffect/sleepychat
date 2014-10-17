var socket = null;
var loggedIn = true;
var lastChat = "";
var chatting = false;
var nick = '';
var isOldTitle = true;
var oldTitle = "Sleepychat";
var newTitle = "*** New message! ***";
var interval = null;
var notify = false;
var snd = new Audio("/sounds/notify.ogg");
var newchatclickedonce = false;
var bigchat = false;
var soundMesg = true;
var soundWhsp = true;
var soundJnLv = true;
var soundSite = true;
var denied = false;
var isDCd = false;

//For YouTube Embedding
var apiKey = "NOTLOADED";
var isYapiLoaded = false;
var youTubeMatcher = /\^~([A-Za-z0-9-_]{11})~\^/g; // Matches stuff between ^~ ~^

//For /r and /reply
var lastMessenger = "";

//For AFK
var date = new Date();
var timeSinceLastMessage = Date.now();
var isAFK = false;

//For Day/Night Mode
var isDay = true;

//For news ticker
var currentNews = [];
var currentNewsInd = 0;
var newsTicker = true;
var initialNews = false;

//For Autocomplete
var users = [];
var tcOptions = {
	minLength: 2
};

var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

$.getScript('/javascripts/tabcomplete.js', function()
{
    $('#mesg-alerts').click(function () {
        
        soundMesg = this.checked;
    });
    
    $('#whsp-alerts').click(function () {
        
        soundWhsp = this.checked;
    });
    
    $('#jnlv-alerts').click(function () {
        
        soundJnLv = this.checked;
    });
    
    $('#site-alerts').click(function () {
        
        soundSite = this.checked;
    });
    
    soundMesg = $('#mesg-alerts').checked;
    soundWhsp = $('#whsp-alerts').checked;
    soundJnLv = $('#jnlv-alerts').checked;
    soundSite = $('#site-alerts').checked;
    
	$('#randomnick').click();
	var socket = io("/", { reconnection: false, transport: ['websocket'] });

	$('#loginform').submit(function()
	{
		return false;
	});

	$('#mutebutton').click(function()
	{
        $('#sound-modal').modal({keyboard: true, backdrop: 'true'});
	});

	socket.on('connect', function()
	{
        
        $('#ticker-x').click(removeTicker);
        
        var errorLabel = document.getElementById('error-label');
		
		var ignore_list = new Array()
		$('#loginsubmit').prop('disabled', false).removeClass('btn-default').addClass('btn-success').text('Start Matchmaking!');
		$('#bigchatsubmit').prop('disabled', false).removeClass('btn-default').addClass('btn-primary').text('Or join the big group chat!');
		$('#nickname').on('input', function()
		{
			var inputNick = $('<div/>').text(($('#nickname').val())).html();
			
			var result = testNick(inputNick);
			errorLabel.innerHTML = result;
		});
		
		$('#loginsubmit').click(function()
		{
			var nick = $('<div/>').text(($('#nickname').val())).html();
			
			if (testNick(nick) != "")
			{
				console.log("Error: '" + nick + "' is not accepted!");
				return false;
			}
			
			var pass = $('<div/>').text(($('#passwordfield').val())).html();

			if($('#iammale').parent().hasClass('active'))
				var gender = 'male';
			else if($('#iamfemale').parent().hasClass('active'))
				var gender = 'female';
			else
				var gender = 'undisclosed';

			if($('#iamtist').parent().hasClass('active'))
				var role = 'tist';
			else if($('#iamsub').parent().hasClass('active'))
				var role = 'sub';
			else
				var role = 'switch';

			if($('#chatwithmales').parent().hasClass('active'))
				var chatwith = 'males';
			else if($('#chatwithfemales').parent().hasClass('active'))
				var chatwith = 'females';
			else
				var chatwith = 'either';

			if($('#iwantrp').parent().hasClass('active'))
				var type = 'roleplaying';
			else if($('#iwanthyp').parent().hasClass('active'))
				var type = 'hypnosis';
			else
				var type = 'either';

			socket.emit('login', { nick: nick, pass: pass, gender: gender, role: role, chatwith: chatwith, type: type });
			
			timeSinceLastMessage = Date.now();
			$('#login-modal').modal('hide');
			return false;
		});

		$('#loginform').submit(function()
		{
			bigchat = true;

			var nick2 = $('<div/>').text(($('#nickname').val())).html();
			
			if (testNick(nick2) != "")
			{
				console.log("Error: '" + nick + "' is not accepted!");
				return false;
			}
			
			var pass2 = $('<div/>').text(($('#passwordfield').val())).html();

			if($('#iammale').parent().hasClass('active'))
				var gender = 'male';
			else if($('#iamfemale').parent().hasClass('active'))
				var gender = 'female';
			else
				var gender = 'undisclosed';

			if($('#iamtist').parent().hasClass('active'))
				var role = 'tist';
			else if($('#iamsub').parent().hasClass('active'))
				var role = 'sub';
			else
				var role = 'switch';

			if($('#chatwithmales').parent().hasClass('active'))
				var chatwith = 'males';
			else if($('#chatwithfemales').parent().hasClass('active'))
				var chatwith = 'females';
			else
				var chatwith = 'either';

			if($('#iwantrp').parent().hasClass('active'))
				var type = 'roleplaying';
			else if($('#iwanthyp').parent().hasClass('active'))
				var type = 'hypnosis';
			else if($('#iwantgeneral').parent().hasClass('active'))
				var type = 'general';
			else
				var type = 'either';

			nick = nick2;

			socket.emit('login', { nick: nick2, pass: pass2, gender: gender, role: role, chatwith: chatwith, type: type, inBigChat: true });
			

			$('#login-modal').modal('hide');
			return false;
		});
        
        socket.on('allow', function(googleApiKey)
		{
			$('#login-modal').modal({keyboard: false, backdrop: 'static'});
            
            apiKey = googleApiKey.keyString;
            if (!isYapiLoaded)
            {
                youtubeApiLoad();
            }
		});
		
		socket.on('denial', function()
		{
			denied = true;
			$('#messages').append($('<li>').html(moment().format('h:mm:ss a') + ":  <span class=\"information\">" + "[INFO] Your connection was refused. There are too many users with your IP address at this time.</span>"));
		});
        
        socket.on('newsmod', function(newsData)
        {
            $('#messages').append($('<li>').html(moment().format('h:mm:ss a') + ":  <span class=\"information\" id=\"newsspan"+newsData.id.toString()+"\">" + "<textarea class='form-control' id='newsmod"+newsData.id.toString()+"' rows='5' style='width: 500px;'>"+newsData.currentVal+"</textarea>Password: <input type='password' class='' id='newsmodpass"+newsData.id.toString()+"' /><button id='newsmodsubmit"+newsData.id.toString()+"'>Submit</button><button id='newsmodcancel"+newsData.id.toString()+"'>Cancel</button></span>"));
            
            $('#newsmodsubmit'+newsData.id.toString()).click(function() {
                
                var newNews = $('#newsmod'+newsData.id.toString()).val();
                var password = $('#newsmodpass'+newsData.id.toString()).val();
                socket.emit('newsmodsubmit', { nick: nick, password: password, newNews: newNews });
                
                var parentItem = document.getElementById('newsspan'+newsData.id.toString()).parentElement;
                parentItem.parentElement.removeChild(parentItem);
                $('#messages').append($('<li>').html(moment().format('h:mm:ss a') + ":  <span class=\"information\">" + "[INFO] News changed.</span>"));
            });
            
            $('#newsmodcancel'+newsData.id.toString()).click(function() {
                
                var parentItem = document.getElementById('newsspan'+newsData.id.toString()).parentElement;
                parentItem.parentElement.removeChild(parentItem);
                $('#messages').append($('<li>').html(moment().format('h:mm:ss a') + ":  <span class=\"information\">" + "[INFO] News mod cancelled.</span>"));
            });
        });
        
        socket.on('newsupdate', function(newNews)
        {
            currentNews = newNews.array;
            
            if (newsTicker)
            {
                $('#sc-news').vTicker('stop');

                $('#news-container').empty();
                for (var i = 0; i < currentNews.length; i++)
                {
                    $('#news-container').append($('<li>').html(currentNews[i]));
                }

                $('#sc-news').vTicker('init');
            }
            
            if (initialNews)
            {
                $('#messages').append($('<li>').html(moment().format('h:mm:ss a') + ":  <span class=\"information\">" + "[INFO] The news was updated!"+(newsTicker? "" : " Use \"/news\" to see it.")+"</span>"));
            }
            else
            {
                initialNews = true;
            }
        });
		
		socket.on('rosterupdate', function(newList)
		{
			users = newList;
            if (!isMobile.any())
            {
                var hadFocus = $("#m").is(":focus")
                $('#m').tabcomplete(users, tcOptions);
                if (hadFocus) { $('#m').focus(); }
            }
		});
		
		socket.on('nickupdate', function(newnick)
		{
			nick = newnick;
		});
		
		socket.on('openroom', function(data)
		{
			var url = window.location.protocol + "//" + window.location.host + "/room/" + data.roomtoken + "/" + data.usertoken;
			$('#messages').append($('<li>').html(moment().format('h:mm:ss a') + ": <span class=\"information\">" + '[INFO] <a id="toclick" href="' + url + '" target="_blank">Click here to enter the private room.</a>' + "</span>"));
			setTimeout(function() { $('#toclick').click(); $('#toclick').attr("id","clicked"); }, 500);
		});
		
		socket.on('whisper', function(sender, receiver, msg)
		{
			if (msg){
				if(notify)
				{
                    if (soundWhsp)
                        snd.play();
                    
					newTitle = "*** " + sender + " messaged you! ***";
					clearInterval(interval);
					interval = setInterval(changeTitle, 1000);
				}
				
				var scroll_down = isWithinScrollThreshold();
                
                if (youTubeMatcher.test(msg))
                {
                    youTubeMatcher.lastIndex = 0;
                    var videoId = youTubeMatcher.exec(msg)[1];
                    youTubeMatcher.lastIndex = 0;
                    msg = msg.replace(youTubeMatcher, "<div class='yt-video-container yt-loader-container' videoid='$1'><div style='vertical-align: middle; text-align: center;'>"+(isYapiLoaded ? "Fetching Video Information..." : "YouTube API Not Loaded =/")+"</div></div>");
                    requestYouTubeEmbed(videoId);
                }
                
				if(sender !== nick)
				{
					lastMessenger = sender;
			
					$('#messages').append($('<li>').html(moment().format('h:mm:ss a') + ": *" + sender + " whispers: " + msg.substring(6 + msg.split(' ')[1].length) + "*"));
					$('#messages > li').filter(':last').addClass('highlight');
				}
				else
				{
					$('#messages').append($('<li>').html(moment().format('h:mm:ss a') + ": *You whisper to " + receiver + ": " + msg.substring(6 + msg.split(' ')[1].length) + "*"));
					$('#messages > li').filter(':last').addClass('self');
				}
				
				scrollDown(scroll_down);
			}
		});

		socket.on('chat message', function(msg, who, userFrom)
		{
			if(msg)
			{
				if(notify)
				{
					if(soundMesg)
						snd.play();
					if(bigchat)
						newTitle = "*** People are talking! ***";
					else
						newTitle = "*** " + lastChat + " messaged you! ***";
					clearInterval(interval);
					interval = setInterval(changeTitle, 1000);
				}

				var scroll_down = isWithinScrollThreshold();
                
                if (youTubeMatcher.test(msg))
                {
                    youTubeMatcher.lastIndex = 0;
                    var videoId = youTubeMatcher.exec(msg)[1];
                    youTubeMatcher.lastIndex = 0;
                    msg = msg.replace(youTubeMatcher, "<div class='yt-video-container yt-loader-container' videoid='$1'><div style='vertical-align: middle; text-align: center;'>"+(isYapiLoaded ? "Fetching Video Information..." : "YouTube API Not Loaded =/")+"</div></div>");
                    requestYouTubeEmbed(videoId);
                }

				$('#messages').append($('<li>').html(moment().format('h:mm:ss a') + ": " + msg));
				var user = msg.match(/&lt;(.+)&gt;/);
				if(who === "me")
				{
					$('#messages > li').filter(':last').addClass('self');
				}
				else if(who === "eval" && msg.lastIndexOf('&lt;' + nick + '&gt;', 0) === 0)
				{
					$('#messages > li').filter(':last').addClass('self');
				}
				
				try
				{
					if(bigchat && msg.split('&gt;')[1].substring(1).indexOf(nick) != -1)
					{
						$('#messages > li').filter(':last').addClass('highlight');
					}
				}
				catch(e) {}
				
				if (userFrom && ignore_list.indexOf(userFrom) != -1)
				{
					$('#messages > li').filter(':last').hide();
				}

				scrollDown(scroll_down);
			}
		});
        
		socket.on('information', function(msg, userFrom)
		{
			if (msg)
			{
				if(notify)
				{
                    if (msg.indexOf("has joined.") == -1 && msg.indexOf("has left.") == -1)
                    {
                        if(soundSite)
                            snd.play();
                    }
                    else
                    {
                        if(soundJnLv)
                            snd.play();
                    }
                    
					newTitle = "*** New message! ***";
					clearInterval(interval);
					interval = setInterval(changeTitle, 1000);
				}
				var scroll_down = isWithinScrollThreshold();
				if (!(userFrom && ignore_list.indexOf(userFrom) != -1))
				{
					$('#messages').append($('<li>').html(moment().format('h:mm:ss a') + ": <span class=\"information\">" + msg + "</span>"));
					scrollDown(scroll_down);
				}

			}
		});

		socket.on('ignore', function(user)
		{
			ignore_list.push(user);
		});

		socket.on('partnerDC', function(nick)
		{
			chatting = false;
			$('#sendbutton').attr('disabled', true);
			var themsg = '[INFO] ' + nick + ' has disconnected from you.';
			var scroll_down = isWithinScrollThreshold();
			$('#messages').append($('<li>').html(moment().format('h:mm:ss a') + ": <span class=\"information\">" + themsg + "</span>"));
			scrollDown(scroll_down);
		});

		socket.on('disconnect', function()
		{
			if(notify)
			{
				if(soundSite)
					snd.play();
				newTitle = "*** Alert ***";
				clearInterval(interval);
				interval = setInterval(changeTitle, 1000);
			}
			var scroll_down = isWithinScrollThreshold();
			if (!denied)
			{
				$('#messages').append($('<li>').html(moment().format('h:mm:ss a') + ":  <span class=\"information\">" + "[INFO] Sorry! You seem to have been disconnected from the server. Please reload the page and try again.</span>"));
			}
			scrollDown(scroll_down);
            isDCd = true;
		});
	});

	socket.on('loggedIn', function()
	{
		loggedIn = true;
		timeSinceLastMessage = Date.now();
		if(bigchat)
		{
            if (!isMobile.any())
            {
                $('#m').focus();
            }
			$('#dcbutton').parent().hide();
			$('#sendbutton').removeAttr('disabled');
			$('#chatbar').unbind('submit');
			$('#chatbar').submit(function()
			{
                var msgInBox = $('#m').val();
                if (msgInBox == "/news")
                {
                    if (!newsTicker)
                    {
                        replaceTicker();
                    }
                }
                else if (msgInBox == "/dialog")
                {
                    $('#iframe-modal').modal({keyboard: true, backdrop: 'true'});
                }
                else
                {
                    socket.emit('chat message', { message: msgInBox });
                    timeSinceLastMessage = Date.now();
                    scrollDown(($(window).scrollTop() + $(window).height() + 300 >= $('body,html')[0].scrollHeight));
                    
                }
                $('#m').val('');
                $('#mhint').val('');
				return false;
			});
			
			$('#m').on('input', function()
			{
				var msgInBox = $('#m').val();
				if (msgInBox.lastIndexOf("/reply ", 0) === 0 && lastMessenger !== "")
				{
					$('#m').val(msgInBox.replace("/reply ", "/msg " + lastMessenger + " "));
				}
				
				if (msgInBox.lastIndexOf("/r ", 0) === 0 && lastMessenger !== "")
				{
					$('#m').val(msgInBox.replace("/r ", "/msg " + lastMessenger + " "));
				}
			});
		}
		else
		{
			$('#chatbar').submit(function()
			{
				return false;
			});
			socket.emit('getNewChat', { first: true });

		}
	});

	socket.on('newChat', function(nick)
	{
		lastChat = nick;
		chatting = true;
		$('#sendbutton').removeAttr('disabled');
		$('#dcbutton').removeAttr('disabled');
		$('#dcbutton').unbind('click');
		$('#dcbutton').click(function()
		{
			if(newchatclickedonce)
			{
				$('#dcbutton').button('reset');
				newchatclickedonce = false;
				socket.emit('getNewChat', { first: false, last: lastChat });
				$('#dcbutton').attr('disabled', true);
				$('#sendbutton').attr('disabled', true);
				if(chatting)
				{
					var msg = "[INFO] You have disconnected from " + lastChat + ".";
					var scroll_down = isWithinScrollThreshold();
					$('#messages').append($('<li>').html(moment().format('h:mm:ss a') + ": <span class=\"information\">" + msg + "</span>"));
					scrollDown(scroll_down);
				}
				chatting = false;
			}
			else
			{
				$('#dcbutton').button('really');
				newchatclickedonce = true;
				setTimeout(function ()
				{
					$('#dcbutton').button('reset');
					newchatclickedonce = false;
				}, 3000);
			}
		});
		$('#chatbar').unbind('submit');
		$('#chatbar').submit(function()
		{
            var msgInBox = $('#m').val();
            if (msgInBox == "/news")
            {
                if (!newsTicker)
                {
                    scrollDown(($(window).scrollTop() + $(window).height() + 300 >= $('body,html')[0].scrollHeight));
                }
            }
            else if (msgInBox == "/dialog")
            {
                $('#iframe-modal').modal({keyboard: true, backdrop: 'true'});
            }
            else
            {
                socket.emit('chat message', { message: msgInBox });
                timeSinceLastMessage = Date.now();
                scrollDown(($(window).scrollTop() + $(window).height() + 300 >= $('body,html')[0].scrollHeight));
            }
            
			$('#m').val('');
			$('#mhint').val('');
			return false;
		});
		
		$('#m').on('input', function()
		{
			var msgInBox = $('#m').val();
			if (msgInBox.lastIndexOf("/reply ", 0) === 0 && lastMessenger !== "")
			{
				$('#m').val(msgInBox.replace("/reply ", "/msg " + lastMessenger + " "));
			}
			
			if (msgInBox.lastIndexOf("/r ", 0) === 0 && lastMessenger !== "")
			{
				$('#m').val(msgInBox.replace("/r ", "/msg " + lastMessenger + " "));
			}
		});
	});

	socket.on('stats', function(stats)
	{
		$('#iammale').parent().html('<input name="iamgender" id="iammale" type="radio"> ' + "Male (" + stats.gender.males + ")");
		$('#iamfemale').parent().html('<input name="iamgender" id="iamfemale" type="radio"> ' + "Female (" + stats.gender.females + ")");
		$('#iamundisclosed').parent().html('<input name="iamgender" id="iamundisclosed" type="radio"> ' + "Undisclosed (" + stats.gender.undisclosed + ")");
		$('#iamtist').parent().html('<input name="iamrole" id="iamtist" type="radio"> ' + "Hypnotist (" + stats.role.tist + ")");
		$('#iamsub').parent().html('<input name="iamrole" id="iamsub" type="radio"> ' + "Subject (" + stats.role.sub + ")");
		$('#iamswitch').parent().html('<input name="iamrole" id="iamswitch" type="radio"> ' + "Switch (" + stats.role.switchrole + ")");
		$('#bigchatsubmit').html('Or join the ' + randomAdjective() + ' public chat! (' + stats.bigroom + ")");
	});

	$(window).blur(function()
	{
		notify = true;
	});

	$(window).focus(function()
	{
		notify = false;
		clearInterval(interval);
		$("title").text(oldTitle);
	});

	var afkTime = 30*60*1000; // 30 minutes in milliseconds

	var afk = setInterval(function(){
		if(bigchat)
		{
			timenow = Date.now()
			if ((!isAFK) && (timenow - timeSinceLastMessage > afkTime)) // If we're not AFK, but we haven't said anything in 2 seconds, then mark ourselves as afk
		    {
		    	socket.emit('AFK', {isAFK: true, nick: nick, time: timenow - timeSinceLastMessage, inPrivate: false})
		    	isAFK = true;
		    }
		    else if(isAFK && (timenow - timeSinceLastMessage <= afkTime)) // If we're AFK, but we have said something in the last 2 seconds, then mark ourselves as not afk
		    {
		    	socket.emit('AFK', {isAFK: false, nick: nick, time: timenow - timeSinceLastMessage, inPrivate: false})
		    	isAFK = false;
		    }
		}

	}, 250);
	socket.on('afk', function()
	{
		if(bigchat)
			timeSinceLastMessage = Date.now() - (afkTime+1000); // simulate the user not having typed something for 8 seconds
	});

	//binaural beat setup
	var playing = false;
	var prevBeat = null;

	socket.on('binaural', function(BBeat)
	{
		if(!BBeat)
			var BBeat = 7;
			var prevBeat = 7; // If they just did /binaural we want to stop the binaurals if they're playing
		var frequency = 65;

		var leftear = (BBeat / 2) + frequency;
		var rightear = frequency - (BBeat / 2);
		if (playing && (prevBeat == BBeat))
		{
			stop();
			playing = false;
		}
		else
		{
			stop();
			SetupBeat(leftear,rightear);
			PlayBeat(BBeat,frequency);
			prevBeat = BBeat
			playing = true;
		}
	});
});

var audiolet = new Audiolet();
var out = audiolet.output;
var sine1,sine2,pan1,pan2,gain;

var SetupBeat = function(leftear,rightear){
	sine1 = new Sine(audiolet, leftear);
	sine2 = new Sine(audiolet, rightear);
	pan1 = new Pan(audiolet, 1);
	pan2 = new Pan(audiolet, 2); 
	gain = new Gain(audiolet, 0.5)
	sine1.connect(pan1);
	sine2.connect(pan2);
}

var PlayBeat = function(beat,frequency){
	beat = parseFloat(beat);
	frequency = parseFloat(frequency);
	var beat = beat / 2;
	var leftear = beat + frequency;
	var rightear = frequency - beat;
	stop();
	SetupBeat(leftear,rightear);
	start();
}

var start = function(){
	pan1.connect(gain);
	pan2.connect(gain);
	gain.connect(out);
}

var stop = function(){
	try
	{
		gain.disconnect(out);
	} catch (e) {}
}

function isWithinScrollThreshold() {
    
    return ($(window).scrollTop() + $(window).height() + 300 >= $('body,html')[0].scrollHeight);
}

function scrollDown(scroll_down)
{
	if (scroll_down)
	{
		$('body,html').stop(true,true).animate({ scrollTop: $('body,html')[0].scrollHeight}, 500);
	}
}

function testNick(nickToTest)
{
	var regex = /^[a-z0-9-_~]+$/i;
	
	if (typeof nickToTest == 'undefined' || nickToTest == null)
	{
		return "Undefined nickname!";
	}
	else if (nickToTest.length < 1)
	{
		return "Please type a nickname!";
	}
	else if (nickToTest.length > 64)
	{
		return "Nickname too long!";
	}
	else if (!regex.test(nickToTest))
	{
		return "Only letters, numbers, dash, underscore, and \"~\"!";
	}
	else
	{
		return "";
	}
}

function replaceTicker()
{
    $('.body').append('<div class="ticker-bg" style="position: fixed; bottom: 40px; width: 100%; height: 34px; padding: 3px;">\n<button id="ticker-x" type="button" class="btn btn-default" style="padding-top: 3px; padding-bottom: 3px; color: #000000; float: right;">X</button>\n<div class="ticker-parent" style="position: relative; width: 97.5%;">\n<div id="sc-news" class="ticker" style="font: 1em Roboto, Helvetica, Arial;">\n<ul id="news-container">\n</ul>\n</div>\n</div>\n</div>');
    
    var messagesSection = document.getElementById('messages');
    messagesSection.style.paddingBottom = "74px";
    
    for (var i = 0; i < currentNews.length; i++)
    {
        $('#news-container').append($('<li>').html(currentNews[i]));
    }
    
    $('#ticker-x').click(removeTicker);
    $('#sc-news').vTicker('init');
    newsTicker = true;
}

function removeTicker()
{
    $('#sc-news').vTicker('stop');
    var tickerDiv = document.getElementById('ticker-x').parentElement;
    tickerDiv.parentElement.removeChild(tickerDiv);
    var messagesSection = document.getElementById('messages');
    messagesSection.style.paddingBottom = "40px";
    newsTicker = false;
}

function loadGif(id, url)
{
    document.getElementById("hiddenInd" + id.toString()).setAttribute("src", "/images/ldg.png");
    document.getElementById("hiddenInd" + id.toString()).setAttribute("onclick", "");
    document.getElementById("hiddenImg" + id.toString()).setAttribute("src", url);
    document.getElementById("hiddenLnk" + id.toString()).setAttribute("href", url);
}

function onGifLoaded(id) {
    document.getElementById("hiddenInd" + id.toString()).style.display = "none";
    document.getElementById("hiddenLnk" + id.toString()).style.display = "";
}

function togglePasswordField ()
{
    var pwField = document.getElementById('password');
    if (pwField.style.display == "none")
    {
        pwField.style.display = "";
    }
    else
    {
        pwField.style.display = "none";
    }
}

function toggleDayNight ()
{
    var stylesheet1 = document.getElementById('stylesheet1');
    var stylesheet2 = document.getElementById('stylesheet2');
    var dayNightToggle = document.getElementById('daynbutton');
    var dayNightImage = document.getElementById('daynimage');
    //Text box
    var mainTextBox = document.getElementById('m');
    var hintTextBox = document.getElementById('mhint');
    
    var scrollValue = (isWithinScrollThreshold() ? -1 : $(window).scrollTop());

    if (isDay)
    {
        stylesheet1.setAttribute('href', '/stylesheets/bootstrap-night.min.css');
        stylesheet2.setAttribute('href', '/stylesheets/style-night.css');
        dayNightImage.setAttribute('src', '/images/day.png');
        hintTextBox.style.backgroundColor = '#222222';
        mainTextBox.style.color = '#ffffff';
        isDay = false;
        if (scrollValue == -1)
        {
            scrollDown(true);
        }
        else
        {
            $(window).scrollTop(scrollValue);
        }
    }
    else if (!isHalloween)
    {
        stylesheet1.setAttribute('href', '/stylesheets/bootstrap.min.css');
        stylesheet2.setAttribute('href', '/stylesheets/style.css');
        dayNightImage.setAttribute('src', '/images/night.png');
        hintTextBox.style.backgroundColor = '#ffffff';
        mainTextBox.style.color = '#000000';
        isDay = true;
        if (scrollValue == -1)
        {
            scrollDown(true);
        }
        else
        {
            $(window).scrollTop(scrollValue);
        }
    }
    else
    {
        var scroll_down = isWithinScrollThreshold();
        $('#messages').append($('<li>').html(moment().format('h:mm:ss a') + ":  <span class=\"information\">" + "[INFO] You're in Halloween Mode. Use \"/halloween\" to turn it off.</span>"));
        scrollDown(scroll_down);
    }
}

// --------------
// For Straw Poll
// --------------
function modalPoll(pollId) {
    
    $('#iframe-modal-body').html("<iframe src='http://strawpoll.me/embed_1/"+pollId+"' style='width: 800px; height: 496px; border: 0; display: block; margin: auto;'>Loading poll...</iframe>");
    $('#iframe-modal-title').text("Straw Poll - Vote Now!");
    
    $('#iframe-modal').modal({keyboard: true, backdrop: 'true'});
}

// -----------
// For YouTube
// -----------
function modalYouTube(videoId) {
    
    $('#iframe-modal-body').html("<iframe width='800' height='450' style='display: block; margin: auto;' src='http://www.youtube.com/embed/"+videoId+"' frameborder='0' allowfullscreen></iframe>");
    $('#iframe-modal-title').text("YouTube");
    
    $('#iframe-modal').modal({keyboard: true, backdrop: 'true'});
}

function requestYouTubeEmbed (videoId) {
    
    if (isYapiLoaded)
    {
        gapi.client.youtube.videos.list({ part: "snippet,contentDetails,status,player,statistics", id: videoId}).then(youtubeRequestSucceeded, youtubeRequestFailed);
    }
    else
    {
        console.log("ERROR: Request attempted, but YouTube's API isn't loaded!")
    }
}

function youtubeApiLoad() {
    
    if (apiKey != "NOKEY" && apiKey != "NOTLOADED")
    {
        gapi.client.setApiKey(apiKey);
        gapi.client.load('youtube', 'v3', function() {
            isYapiLoaded = true;
            console.log('YouTube API v3 Loaded.');
        });
    }
    else if (apiKey == "NOTLOADED")
    {
        console.log('Warning: YT API Key Not Yet Received. Will reattempt after connection to server.');
    }
    else
    {
        console.log('ERROR: YT API Key Invalid.');
    }
    
    apiKey = "";
}

function youtubeRequestSucceeded (resp) {
    
    console.log(resp.result);
    
    var resultingVideo = resp.result.items[0];
    var loadingContainers = document.getElementsByClassName('yt-loader-container');
    var correctContainer = null;
    
    for (var i = 0; i < loadingContainers.length; i++)
    {
        if (loadingContainers[i].getAttribute('videoid') == resultingVideo.id)
        {
            correctContainer = loadingContainers[i];
            break;
        }
    }
    
    if (correctContainer == null)
    {
        console.log('ERROR: Loading container not found for id: ' + resultingVideo.id);
    }
    
    if (/*resultingVideo.processingDetails.processingStatus == "succeeded"*/true)
    {
        correctContainer.className = "";
        correctContainer.style.verticalAlign = "middle";
        correctContainer.style.display = "inline-block";
        
        var id = resultingVideo.id;
        var title = resultingVideo.snippet.title;
        var channel = resultingVideo.snippet.channelTitle;
        var channelLink = "http://http://www.youtube.com/channel/"+resultingVideo.snippet.channelId;
        
        var description = resultingVideo.snippet.description;
        var link = /(?:https?:\/\/)?((?:[\w\-_.])+\.[\w\-_]+\/[\w\-_()\/\,]*(\.[\w\-_()\:]+)?(?:[\-\+=&;%@\.\w?#\/\:\,]*))/gi;
        description = description.replace(link, "<a tabindex='-1' target='_blank' href='http://$1'>$1</a>");
        description = description.replace("\n", "<br />");
        
        var views = resultingVideo.statistics.viewCount.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        
        var length = resultingVideo.contentDetails.duration;
        var hours = length.replace(/PT(?:([0-9])H)?(?:([0-9]{1,2})M)?([0-9]{1,2})S/g, "$1");
        var minutes = length.replace(/PT(?:([0-9])H)?(?:([0-9]{1,2})M)?([0-9]{1,2})S/g, "$2");
        var seconds = length.replace(/PT(?:([0-9])H)?(?:([0-9]{1,2})M)?([0-9]{1,2})S/g, "$3");
        
        length = (hours.length != "" ? hours+":" : "");
        length += (hours != "" ? (minutes != "" ? (minutes.length < 2 ? "0"+minutes : minutes) : "00") : (minutes != "" ? minutes : "0"))+":";
        length += (seconds.length < 2 ? "0"+seconds : seconds);
        
        var displayString = "<div class='yt-video-container'>\n<div class='yt-thumbnail'>\n<a target='_blank' class='yt-thumbnail-imglink' href='http://www.youtube.com/watch?v="+id+"'>\n<span class='yt-thumbnail-imgspan'>\n<img class='yt-thumbnail-img' src='http://i.ytimg.com/vi/"+id+"/mqdefault.jpg' />\n</span>\n<span class='yt-thumbnail-time'>"+length+"</span>\n</a>\n</div>\n<div class='yt-details'>\n<h3 class='yt-details-title'><a target='_blank' href='http://www.youtube.com/watch?v="+id+"'>"+title+"</a></h3>\n<div style='display: block; margin: 5px 0 0;'>\n<ul class='yt-details-meta'>\n<li style='padding: 0px;'>by <a target='_blank' href='"+channelLink+"'>"+channel+"</a></li>\n<li style='padding: 0px;'>"+views+" views</li>\n</ul>\n</div>\n<div class='yt-details-desc'>"+description+"</div>\n</div>\n</div>";
        var embedString = resultingVideo.status.embeddable ? "\n<div class='yt-video-container' style='width: 112px;' videoid='"+id+"'>\n<img src='/images/yt-play-embedded.png' style='cursor: pointer;' onclick='modalYouTube(\""+id+"\")' />\n</div>" : "\n<div class='yt-video-container' style='width: 112px;' videoid='"+id+"'>\n<img src='/images/yt-cant-embed.png' />\n</div>";
        
        correctContainer.innerHTML = displayString+embedString;
    }
    else
    {
        correctContainer.innerHTML = "<span style='vertical-align: middle; text-align: center;'>Video Not Processed.</span>";
    }
}

function youtubeRequestFailed (reason) {
    
    isYapiLoaded = false;
    console.log("Error: " + reason.result.message);
    var loadingContainers = document.getElementsByClassName('yt-loader-container');
    
    for (var i = 0; i < loadingContainers.length; i++)
    {
        loadingContainers[i].innerHTML = "YouTube API Not Loaded =/"
    }
}
// -----------
// Regex Stuff
// -----------
function link_replacer(match, p1, p2, offset, string)
{
    return "<a tabindex='-1' target='_blank' href='http://"+p1+"'>"+p1+"</a>";
}

window.onbeforeunload = confirmExit;
function confirmExit()
{
	if ((chatting || bigchat) && !isDCd)
		return "Wait, you're still in a chat session!";
}

function changeTitle()
{
	document.title = isOldTitle ? oldTitle : newTitle;
	isOldTitle = !isOldTitle;
}

function randomAdjective(){
	var adjs = ['adaptable', 'adventurous', 'affable', 'affectionate', 'agreeable', 'ambitious', 'amiable', 'amicable', 'amusing', 'brave', 'bright', 'broad-minded', 'calm', 'charming', 'communicative', 'compassionate ', 'conscientious', 'considerate', 'convivial', 'courageous', 'courteous', 'creative', 'decisive', 'determined', 'diligent', 'diplomatic', 'discreet', 'dynamic', 'easygoing', 'emotional', 'energetic', 'enthusiastic', 'exuberant', 'fair-minded', 'faithful', 'fearless', 'forceful', 'frank', 'friendly', 'funny', 'generous', 'gentle', 'good', 'gregarious', 'hard-working', 'helpful', 'honest', 'humorous', 'imaginative', 'impartial', 'independent', 'intellectual', 'intelligent', 'intuitive', 'inventive', 'kind', 'loving', 'loyal', 'modest', 'neat', 'nice', 'optimistic', 'passionate', 'patient', 'persistent ', 'pioneering', 'philosophical', 'placid', 'plucky', 'polite', 'powerful', 'practical', 'pro-active', 'quick-witted', 'quiet', 'rational', 'reliable', 'reserved', 'resourceful', 'romantic', 'self-confident', 'sensible', 'sensitive', 'sociable', 'straightforward', 'thoughtful', 'unassuming', 'understanding', 'versatile', 'warmhearted', 'willing', 'witty', 'mysterious', 'incredible', 'amazing', 'stupefying', 'unbelieveable', 'mind-blowing'];
	return adjs[Math.floor(Math.random()*adjs.length)]
}

$("#bugsandfeatures").click(function()
{
	window.location = "https://github.com/MrMeapify/sleepychat/issues";
});

$("#legalities").click(function()
{
	window.location = window.location.protocol + "//" + window.location.host + "/legal";
});

$('#randomnick').click(function()
{
	var adjs = ['Good', 'Mindless', 'Little', 'Tired', 'Wise', 'Dreamy', 'Sleepy', 'Blank', 'Enchanted', 'Enchanting', 'Entranced', 'Hypnotic', 'Bad', 'The', 'Hypnotized'];
	var animals = ['Alligator', 'Crocodile', 'Alpaca', 'Ant', 'Antelope', 'Ape', 'Armadillo', 'Donkey', 'Baboon', 'Badger', 'Bat', 'Bear', 'Beaver', 'Bee', 'Beetle', 'Buffalo', 'Butterfly', 'Camel', 'Caribou', 'Cat', 'Cattle', 'Cheetah', 'Chimpanzee', 'Chinchilla', 'Cicada', 'Clam', 'Cockroach', 'Cod', 'Coyote', 'Crab', 'Cricket', 'Crow', 'Raven', 'Deer', 'Dinosaur', 'Dog', 'Dolphin', 'Porpoise', 'Duck', 'Eel', 'Elephant', 'Elk', 'Ferret', 'Fishfly', 'Fox', 'Frog', 'Toad', 'Gerbil', 'Giraffe', 'Gnat', 'Gnu', 'Wildebeest', 'Goat', 'Goldfish', 'Gorilla', 'Grasshopper', 'Hamster', 'Hare', 'Hedgehog', 'Herring', 'Hippopotamus', 'Hornet', 'Horse', 'Hound', 'Hyena', 'Insect', 'Jackal', 'Jellyfish', 'Kangaroo', 'Wallaby', 'Leopard', 'Lion', 'Lizard', 'Llama', 'Locust', 'Moose', 'Mosquito', 'Mouse', 'Rat', 'Mule', 'Muskrat', 'Otter', 'Ox', 'Oyster', 'Panda', 'Pig', 'Hog', 'Platypus', 'Porcupine', 'Pug', 'Rabbit', 'Raccoon', 'Reindeer', 'Rhinoceros', 'Salmon', 'Sardine', 'Shark', 'Sheep', 'Skunk', 'Snail', 'Snake', 'Spider', 'Squirrel', 'Termite', 'Tiger', 'Trout', 'Turtle', 'Tortoise', 'Walrus', 'Weasel', 'Whale', 'Wolf', 'Wombat', 'Woodchuck', 'Worm', 'Yak', 'Zebra'];
	$('#nickname').val(adjs[Math.floor(Math.random()*adjs.length)] + animals[Math.floor(Math.random()*animals.length)] + (Math.floor(Math.random() * (9 - 1)) + 1) + (Math.floor(Math.random() * (9 - 1)) + 1));
});
