/*
 * Front end edit contestant details
 */
function EditContestantSetup(cid, cname)
{
	saveCookie("QMContestantID", cid, 1);
	NewWin("editcontestant.html", "Edit Contestant "+cname);
}

/*
 * edit contestant mid page
 */
function EditContestantPage()
{
	var cid = readCookie("QMContestantID");
	var response = doAjaxGet(CONTESTANT_URL+cid);
	var myobj = JSON.parse(response);
	if(myobj.error != null)		// there was an error response
	{
		console.log(myobj.error.message);
		document.getElementById("response").innerHTML = myobj.error.description;
		return;
	}
	
	document.getElementById("title").innerHTML = "Edit Contestant "+myobj.contestantName;
	var cform = document.getElementById("contestantform");
	cform.elements["contestantid"].value = cid;
	cform.elements["contestantname"].value = myobj.contestantName;
	cform.elements["qmaccesscode"].value = myobj.accessCode;
	cform.elements["contestantemail"].value = myobj.email;
}

/*
 * used for contestant to login so he can play a game
 */
function JoinGame()
{
	gform = document.getElementById("joingameform");
	gname = gform.elements['gamename'].value;
	gcont = gform.elements['contestantname'].value;
	gcode = gform.elements['qmaccesscode'].value;

	var url = QMAUTH_URL+"/contestant?app_id="+APP_ID;

//	var postdata = "gamename="+gname+"&contestantname="+gcont+"&qmaccesscode="+gcode;
	var credentials = gname+":"+gcont+":"+gcode;
	var response = doAjaxGetWithBasicAuth(url, credentials);
//	alert("JSON response is: "+response);
	var myobj = JSON.parse(response);
	if(myobj.error != null)		// there was an error response
	{
		console.log(myobj.error.message);
		document.getElementById("response").innerHTML = myobj.error.description;
		return;
	}
	
	var qmcid = myobj.user_id;
	var token = myobj.access_token;
	var time = myobj.expires_in;
	saveCookie("QMContestantID", qmcid, time);
	saveCookie("QMCAccessToken", token, time);
	saveCookie("QMGameName", gname, time);
	window.location.assign("playgame.html");
}

/*
 * Called by contestants during game play
 */
function ContPlayGame()
{
	var gname = readCookie("QMGameName");
//	var cid = readCookie("QMContestantID");
	document.getElementById("title").innerHTML = "Playing Game: "+gname;

	(function cpoll(){
		setTimeout(function(){
			response = doAjaxGetContestant(CONTESTANT_URL+"/question");
			myobj = JSON.parse(response);
//			document.getElementById("response").innerHTML = response;
			if(myobj.error != null)		// there was an error response
			{
				document.getElementById("answerinfo").innerHTML = "";
				document.getElementById("questioninfo").innerHTML = myobj.error.description;
			}
			else	// show the question
			{
				if(CURRENT_QUESTION != myobj.questionNo)		// question has changed
					document.getElementById("answerinfo").innerHTML = "";
				
				var qu = DisplayQuestion(myobj);
				document.getElementById("questioninfo").innerHTML = qu;
			}
			cpoll(); // do it all again
			}, 3000);
		})();
}

function SubmitAnswer()
{
//	var cid = readCookie("QMContestantID");

	var pform = document.getElementById("playgameform");
	var answerurl = CONTESTANT_URL+"/answer";
	var ans = pform.elements["answer"].value;
	var postdata = "answer="+ans;
	var response = doAjaxPostContestant(answerurl, postdata);
//	document.getElementById("response").innerHTML = response;
	var myobj = JSON.parse(response);
	document.getElementById("answerinfo").innerHTML = "Your answer: " +ans;
}

/*
 * Show scores after game has finished for contestant only
 * questions/answers are put into DOM questioninfo
 * contestant scores are put into DOM contestantinfo
 */
function ShowResults()
{	
	var gameid = readCookie("QMGameID");
	var gname = readCookie("QMGameName");
	document.getElementById("title").innerHTML = "Results for Game: "+gname;

	var response = doAjaxGetContestant(CONTESTANT_URL+"/scores");
	myobj = JSON.parse(response);
	if(myobj.error != null)		// there was an error response
	{
//		console.log(myobj.error.message);
		document.getElementById("response").innerHTML = myobj.error.description;
		return;
	}
	
	CreateQuestionTable(myobj);
	CreateC2AnswerTable(myobj);
}

