var HOST = "http://localhost:8888/";
//var HOST = "https://tcc-quizmaster.appspot.com/";
var QM_URL = HOST + "apiv1/qm";
var QMAUTH_URL = HOST + "apiv1/qmauth";
var GAME_URL = HOST + "apiv1/qmgames";
var QUESTION_URL = HOST + "apiv1/qmquestions/";
var CONTESTANT_URL = HOST + "apiv1/qmcontestants";
//var APP_ID = "5642554087309312";	// tropical google id appengine
//var APP_SECRET = "MmQwYjNkZTM5NDA3OWYxZTZmNzQ1OTkw";	// tropical google id appengine
var APP_ID = "5717460464435200";	// tropical facebook locahost
//var APP_SECRET = "YTg1Mzg4YmVjMGE2MGRmYTkyN2NlZDBl";	// tropical facebook locahost
var FINISH_FLAG = 0;
var CURRENT_QUESTION = 0;

function AddGame()
{
	gform = document.getElementById("newgameform");
	gname = gform.elements['qmgname'].value;
	gcat = gform.elements['qmgcat'].value;
	gdiff = gform.elements['qmgdiff'].value;
	gnumqu = gform.elements['qmgnumqu'].value;
	gsubcat = gform.elements['qmgsubcat'].value;
//	gtimelimit = gform.elements['mpgtimelimit'].value;
//	gqumethod = gform.elements['mpgqumethod'].value;

	var postdata = "qmgname="+gname+"&qmgcat="+gcat+"&qmgsubcat="+gsubcat+"&qmgdiff="+gdiff+"&qmgnumqu="+gnumqu;

	var response = doAjaxPost(GAME_URL,postdata);
//	console.log(response);
	var myobj = JSON.parse(response);
	if(myobj.error != null)		// there was an error response
	{
//		console.log(myobj.error.message);
		document.getElementById("response").innerHTML = myobj.error.description;
		return;
	}
//	alert("Game id is "+myobj.gameId);
	document.getElementById("response").innerHTML = myobj.gameName+" successfully setup";
}

/*
 * Front end game page setup for an existing game
 */
function GamePageSetup(gameid, gamename, htmlpage)
{
	saveCookie("QMGameID", gameid, 1);
	saveCookie("QMGameName", gamename, 1);
	NewWin(htmlpage,gamename);
//	window.location.href=htmlpage; // for testing
}

/*
 * Mid edit game details of an existing game
 */
function EditGamePage()
{
	var gameid = readCookie("QMGameID");
	var url = GAME_URL+"/"+gameid;
	if((game = doAjaxGetJSONObject(url)) == null) return;

	document.getElementById("title").innerHTML = "Edit "+game.gameName;
	var uform = document.getElementById("playgameform");
	uform.elements["qmgid"].value = game.gameId;
	uform.elements["qmgname"].value = game.gameName;
//	var elcat = uform.elements["mpgcat"];
//	elcat.value = game.category;
	document.getElementById("catoption").value = game.category;
	populateSubCat("catoption","scoption");
	document.getElementById("scoption").value = game.subCategory;
	uform.elements["qmgnumqu"].value = game.numQuestions;
//	uform.elements["qmgtimelimit"].value = game.timeLimit;
//	uform.elements["qmgqumethod"].value = game.questionMethod;
}

function GetMyGames()
{
	if((myobj = doAjaxGetJSONObject(GAME_URL)) == null) return;

	var gamestable = CreateGamesTable();
	PopulateGamesTable(myobj,gamestable);
	document.getElementById("games").appendChild(gamestable);
}

/*
 * Front end add contestant 
 */
function AddContestantPage(gameid, gamename)
{
	saveCookie("QMGameID", gameid, 1);
	var ConForm = NewWin("addcontestant.html", "Add Contestant");
	var doc = ConForm.document;
	doc.getElementById("info").innerHTML = "Game: "+gamename;

}

function AddContestant()
{
	var gameid = readCookie("QMGameID");
	var cform = document.getElementById("contestantform");
	ccont = cform.elements['contestantname'].value;
	ccode = cform.elements['qmaccesscode'].value;
	cemail = cform.elements['contestantemail'].value;

	var postdata = "contestantname="+ccont+"&qmaccesscode="+ccode+"&contestantemail="+cemail;
	var response = doAjaxPost(GAME_URL+"/"+gameid+"/contestant", postdata);
	var myobj = JSON.parse(response);
	if(myobj.error != null)		// there was an error response
	{
		console.log(myobj.error.message);
		document.getElementById("response").innerHTML = myobj.error.description;
		return;
	}
	
//	document.getElementById("response").innerHTML = response; // for testing
	document.getElementById("response").innerHTML = ccont+" added successfully";
}

/*
 * Mid end for showing contestants
 */
function ShowContestantsPage()
{
	var gameid = readCookie("QMGameID");
	var url = GAME_URL+"/"+gameid+"/contestants";
	if((myobj = doAjaxGetJSONObject(url)) == null) return;
	var constable = document.getElementById("contestanttable");
	var cons = new Array();
	cons = myobj.contestants;
	for(cnt = 0; cnt < myobj.numContestants; cnt++)
	{
		AddRowToContestantTable(cnt,constable,cons);
	}
}

/************check this*************
 * Update the add contestant form with game details
 */
function UpdateContestantForm()
{
	var url = GAME_URL+"/"+gameid+"/contestants";
	if((response = doAjaxGetJSONObject(url)) == null) return;
	document.getElementById("response").innerHTML = response;
//	contable = ConTableCreate();
	var jsobj = JSON.parse(response);
}

function CreateGamesTable()
{
    var gamestable  = document.createElement("TABLE");
    gamestable.id  = 'gamestable';

    var header = gamestable.createTHead();
    var row = header.insertRow(0);
    var col1 = document.createElement("th");
    col1.innerHTML = "Game Name";
    row.appendChild(col1);
    var col2 = document.createElement("th");
    col2.innerHTML = "Category";
    row.appendChild(col2);
    var col3 = document.createElement("th");
    col3.innerHTML = "Subcategory";
    row.appendChild(col3);
    var col4 = document.createElement("th");
    col4.innerHTML = "No. of Questions";
    row.appendChild(col4);
//    var col5 = document.createElement("th");
//    col5.innerHTML = "Time per Question";
//    row.appendChild(col5);
    var col6 = document.createElement("th");
    col6.innerHTML = "No. of Contestants";
    row.appendChild(col6);
    
    return (gamestable);
}

function CreateContestantTable()
{
    var constable  = document.createElement("TABLE");
    constable.id = "contestanttable";

    var header = constable.createTHead();
    var row = header.insertRow(0);
    var col1 = document.createElement("th");
    col1.innerHTML = "Contestant Name";
    row.appendChild(col1);
    var col2 = document.createElement("th");
    col2.innerHTML = "Status";
    row.appendChild(col2);
    var col3 = document.createElement("th");
    col3.innerHTML = "Answer";
    row.appendChild(col3);
    
    return (constable);
}

function PopulateGamesTable(jsobj, gtable)
{
//	var jsobj = JSON.parse(response);
	var games = new Array();
	games = jsobj.games;
	for(cnt = 0; cnt < jsobj.numGames; cnt++)
	{
		var row = gtable.insertRow(cnt+1);	// there is already a header row
	    var col1 = row.insertCell(0);
	    col1.innerHTML = games[cnt].gameName;
	    var col2 = row.insertCell(1);
	    col2.innerHTML = games[cnt].category;
	    var col3 = row.insertCell(2);
	    col3.innerHTML = games[cnt].subCategory;
	    var col4 = row.insertCell(3);
	    col4.innerHTML = games[cnt].numQuestions;
//	    var col5 = row.insertCell(3);
//	    col5.innerHTML = games[cnt].timeLimit;
	    var col6 = row.insertCell(4);
	    col6.innerHTML = games[cnt].contestants.numContestants;
	    var col7 = row.insertCell(5);
	    col7.innerHTML = "<a href='#' onClick='GamePageSetup("+games[cnt].gameId+",\""+games[cnt].gameName+"\",\"addcontestant.html\")'><img src='icons/teamicon40.png' title='Add contestants'/></a>";
	    var col8 = row.insertCell(6);
	    col8.innerHTML = "<a href='#' onClick='GamePageSetup("+games[cnt].gameId+",\""+games[cnt].gameName+"\",\"showcontestants.html\")'><img src='icons/contestants40.jpg' title='Manage contestants'/></a>";
	    var col9 = row.insertCell(7);
	    col9.innerHTML = "<a href='#' onClick='GamePageSetup("+games[cnt].gameId+",\""+games[cnt].gameName+"\",\"reviewgamequestions.html\")'><img src='icons/questions40.png' title='Review questions'/></a>";
	    var col10 = row.insertCell(8);
	    col10.innerHTML = "<a href='#' onClick='GamePageSetup("+games[cnt].gameId+",\""+games[cnt].gameName+"\",\"startgame.html\")'><img src='icons/start40.png' title='Start Game'/></a>";
	    var col11 = row.insertCell(9);
	    col11.innerHTML = "<a href='#' onClick='GamePageSetup("+games[cnt].gameId+",\""+games[cnt].gameName+"\",\"resumegame.html\")'><img src='icons/playicon40.png' title='Resume Game'></a>";
	    var col12 = row.insertCell(10);
	    col12.innerHTML = "<a href='#' onClick='GamePageSetup("+games[cnt].gameId+",\""+games[cnt].gameName+"\",\"showscores.html\")'><img src='icons/scores40.png' title='Show Scores'></a>";
	    var col13 = row.insertCell(11);
	    col13.innerHTML = "<a href='#' onClick='GamePageSetup("+games[cnt].gameId+",\""+games[cnt].gameName+"\",\"editgame.html\")'><img src='icons/gears40.png' title='Edit Game'/></a>";
	    var col14 = row.insertCell(12);
	    col14.innerHTML = "<a href='#' onClick='DeleteGamePage("+games[cnt].gameId+",\""+games[cnt].gameName+"\")'><img src='icons/trash40.png' title='Delete Game'/></a>";
	}
}


function AddRowToContestantTable(cnt,ctable,contestants)
{
	var row = ctable.insertRow(cnt+1);	// there is already a header row
    var col1 = row.insertCell(0);
    col1.innerHTML = contestants[cnt].contestantName;
    var col2 = row.insertCell(1);
    col2.innerHTML = contestants[cnt].email;
    var col3 = row.insertCell(2);
    col3.innerHTML = contestants[cnt].accessCode;
    var col4 = row.insertCell(3);
    col4.innerHTML = contestants[cnt].status;
    var col5 = row.insertCell(4);
    col5.innerHTML = "<a href='#' onClick='EditContestantSetup("+contestants[cnt].contestantId+",\""+contestants[cnt].contestantName+"\")'><img src='icons/gears40.png' title='Edit'></a>";
    var col6 = row.insertCell(5);
    col6.innerHTML = "<a href='#' onClick='DeleteContestant("+contestants[cnt].contestantId+",\""+contestants[cnt].contestantName+"\")'><img src='icons/trash40.png' title='Delete'></a>";
}

/*
 * used during a game to show all contestants and their submitted answers
 */
function UpdateGameContestantTable(response, qno)
{
	var ctable = document.getElementById("contestanttable");
	var contestants = new Array();
	var answers = new Array();
	var cnt;
	var jsobj = JSON.parse(response);
	contestants = jsobj.contestants;
	
	for(cnt = 0; cnt < jsobj.numContestants; cnt++)
	{
		var col1 = ctable.rows[cnt+1].cells[0];
		var col2 = ctable.rows[cnt+1].cells[1];
		var col3 = ctable.rows[cnt+1].cells[2];
		col1.innerHTML = contestants[cnt].contestantName;
	    col2.innerHTML = contestants[cnt].status;
		answers = contestants[cnt].answers;
		if(qno != 0)		// check game has started
			col3.innerHTML = answers[qno-1];		// array starts from 0
	}
}

/*
 * used at start of game to show all contestants and their submitted answers
 */
function PopulateGameContestantTable(response)
{
	var parent = document.getElementById("contestantinfo");
	var child = document.getElementById("contestanttable");
	if(child != null)
		parent.removeChild(child);
	
	var ctable  = CreateContestantTable();	// create table and headers
    
 	var contestants = new Array();
	var jsobj = JSON.parse(response);
	contestants = jsobj.contestants;
	if(jsobj.numContestants == 0)
	{
		return false;
	}
	
	var qno = CURRENT_QUESTION;
	var cnt;
	for(cnt = 0; cnt < jsobj.numContestants; cnt++)
	{
		var row = ctable.insertRow(cnt+1);	// there is already a header row
	    var col1 = row.insertCell(0);
	    var col2 = row.insertCell(1);
	    var col3 = row.insertCell(2);
	    col1.innerHTML = contestants[cnt].contestantName;
	    col2.innerHTML = contestants[cnt].status;
		answers = contestants[cnt].answers;
		if(qno != 0)		// check game has started
			col3.innerHTML = answers[qno-1];		// array starts from 0
	}
	
	parent.appendChild(ctable);

	return true;
}

/*
 * Run within startgame.html when starting a new page
 * second window - show questions
 * first window - show answers submitted by contestants
 */
function QMPlayGame(action)		// action is start or continue
{
	var gameid = readCookie("QMGameID");
	var gname = readCookie("QMGameName");
	document.getElementById("title").innerHTML = "Playing Game: "+gname;
//	alert("Game id and name is "+gameid+" "+gname);
	var response = doAjaxGet(GAME_URL+"/"+gameid+"/contestants");
	PopulateGameContestantTable(response);		// within id "contestanttable"
	var prompt;
	
	if(action == "start")
	{
		CURRENT_QUESTION = 0;
		prompt = "Ask first question";
	}
	else	// next or resume
	{
		prompt = "Next question";
	}
	var response = doAjaxPut(GAME_URL+"/"+gameid+"/"+action);
	var myobj = JSON.parse(response);
	if(myobj.error != null)		// there was an error response
	{
		console.log(myobj.error.message);
		document.getElementById("response").innerHTML = myobj.error.description;
		return;
	}
	
	var str = "<p><a href='#' onClick='UpdateDuringPlay()'>"+prompt+"</a></p>";
	document.getElementById("questioninfo").innerHTML = str;
	
/*	(function qmpoll(){
		setTimeout(function(){
			if(FINISH_FLAG == 1) return;
			response = doAjaxGet(GAME_URL+"/"+gameid+"/contestant");
			document.getElementById("error").innerHTML = response;	// for testing
			UpdateGameContestantTable(response, CURRENT_QUESTION);
			qmpoll(); // do it all agsin
			}, 3000);
		})();*/
	
	setInterval(function() {doAjaxGetAsync(gameid)}, 3000);
	
}

/*
 * This function poses a question and updates the contestable with last answer.
 * Loops until all questions finished or user quits
 */
function UpdateDuringPlay()
{
	gameid = readCookie("QMGameID");

	var response = doAjaxPut(GAME_URL+"/"+gameid+"/next");
	var myobj = JSON.parse(response);
	if(myobj.error != null)		// there was an error response
	{
		console.log(myobj.error.message);
		document.getElementById("response").innerHTML = myobj.error.description;
		return;
	}
	txt = DisplayQuestion(myobj);
//	alert(txt);
	CURRENT_QUESTION = myobj.questionNo;
	txt = txt +	"<p><a href='#' onClick='UpdateDuringPlay()'>Next Question</a><br/>" +
//			"<a href='#' onClick='QMPlayGame(\"start\")'>Restart Game</a><br/>" +
			"<a href='#' onClick='FinishGame("+gameid+")'>End Game and Show Scores</a></p>";
	document.getElementById("questioninfo").innerHTML = txt;
}


/*
 * ends the game and receives scores message with questions, answers and contestant answers
 */
function FinishGame(gameid)
{	
	FINISH_FLAG = 1;
	document.getElementById("questioninfo").innerHTML = "";		// blank out space
	document.getElementById("response").innerHTML = "";		// blank out space
	var parent = document.getElementById("contestantinfo");
	var child = document.getElementById("contestanttable");
	if(child != null)
		parent.removeChild(child);
	
	var response = doAjaxPut(GAME_URL+"/"+gameid+"/finish");
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

/*
 * Display all game questions and answers
 */
function CreateQuestionTable(jobj)
{
    var qtable  = document.createElement("TABLE");
    qtable.id = "questiontable";

    var header = qtable.createTHead();
    var row = header.insertRow(0);
    var col1 = document.createElement("th");
    col1.innerHTML = "Question No.";
    row.appendChild(col1);
    var col2 = document.createElement("th");
    col2.innerHTML = "Question";
    row.appendChild(col2);
    var col3 = document.createElement("th");
    col3.innerHTML = "Answer";
    row.appendChild(col3);
    
	var questions = new Array();
	questions = jobj.questions;
	for(cnt = 0; cnt < jobj.numQuestions; cnt++)
	{
		row = qtable.insertRow(cnt+1);	// there is already a header row
	    col1 = row.insertCell(0);
	    col2 = row.insertCell(1);
	    col3 = row.insertCell(2);

	    col1.innerHTML = questions[cnt].questionNo;
	    col2.innerHTML = questions[cnt].question;
	    col3.innerHTML = questions[cnt].answer;	// array starts from 0
	}
	
	document.getElementById("questioninfo").appendChild(qtable);
}

/* 
 * Used to display contestant answers for each question after game finished
 * for each question show answers from all contestants and score
 * as opposed to for each contestant show all answers and scores.
 */
function CreateCAnswerTable(jobj)
{
    var ctable  = document.createElement("TABLE");
//    ctable.id = "canswertable";
    ctable.id = "contestanttable";

    var header = ctable.createTHead();
    var row = header.insertRow(0);
    var col1 = document.createElement("th");
    col1.innerHTML = "Question No.";
    row.appendChild(col1);
    var col2 = document.createElement("th");
    col2.innerHTML = "Name";
    row.appendChild(col2);
    var col3 = document.createElement("th");
    col3.innerHTML = "Answer";
    row.appendChild(col3);
    var col4 = document.createElement("th");
    col4.innerHTML = "Score";
    row.appendChild(col4);
    
	cont = new Array();
	cont = jobj.contestants;
	rowNo = 1;
	for(qno = 0; qno < jobj.numQuestions; qno++)
	{
		for(cnt = 0; cnt < jobj.numContestants; cnt++)
		{	    
			row = ctable.insertRow(rowNo++);
		    col1 = row.insertCell(0);
		    col2 = row.insertCell(1);
		    col3 = row.insertCell(2);
		    col4 = row.insertCell(3);

		    col1.innerHTML = qno+1;		// question number
		    col2.innerHTML = cont[cnt].contestantName;
			answers = cont[cnt].answers;
		    col3.innerHTML = answers[qno];
			scores = cont[cnt].scores;
		    col4.innerHTML = scores[qno];
		}
	}
	
	document.getElementById("contestantinfo").appendChild(ctable);

}

/* 
 * Used to display contestant answers for each question after game finished
 * for each contestant show answers from all questions
 * red if answer incorrect, green if correct. Total at end of each row.
 */
function CreateC2AnswerTable(jobj)
{
    var ctable  = document.createElement("TABLE");
    ctable.id = "contestanttable";

    var header = ctable.createTHead();
    var row = header.insertRow(0);
    var col1 = document.createElement("th");
    col1.innerHTML = "Contestant";
    row.appendChild(col1);
    var col, cell, qno, cnt;
	for(qno = 0; qno < jobj.numQuestions; qno++)
	{
	    col = document.createElement("th");
	    col.innerHTML = "Question "+(qno+1);
	    row.appendChild(col);
	}
    col = document.createElement("th");
    col.innerHTML = "Total";
    row.appendChild(col);
    
	var cont = new Array();
	var answers = new Array();
	var scores = new Array();
	cont = jobj.contestants;
	rowNo = 1;
	for(cnt = 0; cnt < jobj.numContestants; cnt++)
	{	    
		row = ctable.insertRow(rowNo++);
	    cell = row.insertCell();
	    cell.innerHTML = cont[cnt].contestantName;
		answers = cont[cnt].answers;
		scores = cont[cnt].scores;
		var total = 0;
		for(qno = 0; qno < jobj.numQuestions; qno++)
		{
		    cell = row.insertCell();
/*		    if(scores[qno] == 1)	// correct answer
		    	cell.style.backgroundColor = "green";
		    else
		    	cell.style.backgroundColor = "red"; */
		    if(scores[qno] == 1)	// correct answer
		    	cell.style.color = "green";
		    else
		    	cell.style.color = "red";
		    	
		    cell.innerHTML = answers[qno];
		    total = total + scores[qno];
		}
	    cell = row.insertCell();
	    cell.innerHTML = total;
	}
	
	document.getElementById("contestantinfo").appendChild(ctable);
}

/*
 * Show scores after game has finished.
 * questions/answers are put into DOM questioninfo
 * scores are put into DOM contestantinfo
 */
function ShowScores()
{	
	var gameid = readCookie("QMGameID");
	var gname = readCookie("QMGameName");
	document.getElementById("title").innerHTML = "Scores for Game: "+gname;

	var url = GAME_URL+"/"+gameid+"/scores";
	if((myobj = doAjaxGetJSONObject(url)) == null) return;

	CreateQuestionTable(myobj);
	CreateC2AnswerTable(myobj);
}

/*
 * Back end update game details for an existing game.
 * send a REST API Put message
 */
function UpdateGame()
{
	var gform = document.getElementById("playgameform");
	var gameid = gform.elements['qmgid'].value;
	var gname = gform.elements['qmgname'].value;
	var gcat = gform.elements['qmgcat'].value;
	var gsubcat = gform.elements['qmgsubcat'].value;
	var gnumqu = gform.elements['qmgnumqu'].value;
//	var gtimelimit = gform.elements['qmgtimelimit'].value;
//	var gqumethod = gform.elements['qmgqumethod'].value;

	var putdata = "qmgname="+gname+"&qmgcat="+gcat+"&qmgsubcat="+gsubcat+"&qmgnumqu="+gnumqu;

	var response = doAjaxPut(GAME_URL+"/"+gameid,putdata);
//	alert(response);
	myobj = JSON.parse(response);
	if(myobj.error != null)		// there was an error response
	{
//		console.log(myobj.error.message);
		document.getElementById("response").innerHTML = myobj.error.description;
		return;
	}

	document.getElementById("response").innerHTML = "Game updated successfully";
}

/*
 * Back end update contestant.
 * send a REST API Put message
 */
function UpdateContestant()
{
	var cform = document.getElementById("contestantform");
	var cid = cform.elements["contestantid"].value;
	var cname = cform.elements["contestantname"].value;
	var ccode = cform.elements["qmaccesscode"].value;
	var cemail = cform.elements["contestantemail"].value;

	var putdata = "contestantname="+cname+"&qmaccesscode="+ccode+"&contestantemail="+cemail;

	var response = doAjaxPut(CONTESTANT_URL+cid,putdata);
//	alert(response);
	myobj = JSON.parse(response);
	if(myobj.error != null)		// there was an error response
	{
//		console.log(myobj.error.message);
		document.getElementById("response").innerHTML = myobj.error.description;
		return;
	}

	document.getElementById("response").innerHTML = "Contestant updated successfully";
}

/*
 * delete game for an existing game
 */
function DeleteGamePage(gameid, gamename)
{
	var response = doAjaxDelete(GAME_URL+"/"+gameid);
	var myobj = JSON.parse(response);
	if(myobj.error != null)		// there was an error response
	{
//		console.log(myobj.error.message);
		document.getElementById("response").innerHTML = myobj.error.description;
		return;
	}
	document.getElementById("response").innerHTML = myobj.success.description;
	alert("Game "+gamename+" deleted");
	window.location.reload();
}

/*
 * Delete contestant 
 */
function DeleteContestant(cid, cname)
{
	var response = doAjaxDelete(CONTESTANT_URL+cid);
	var myobj = JSON.parse(response);
	if(myobj.error != null)		// there was an error response
	{
//		console.log(myobj.error.message);
		document.getElementById("response").innerHTML = myobj.error.description;
		return;
	}
	
	document.getElementById("response").innerHTML = myobj.success.description;
	alert("Contestant "+cname+" deleted");
	window.location.reload();
}

/*
 * Display the question within the json object
 */
function DisplayQuestion(myobj)
{
	CURRENT_QUESTION = myobj.questionNo;
	var txt;
	
	txt = "<p>Question: "+myobj.questionNo+" of "+myobj.numQuestions+"<br/>" +
				"Question category: "+myobj.category+"<br/>" +
				"Question subcategory: "+myobj.subCategory+"<br/>" +
//				"Question type: "+myobj.type+"</p>" +
				"<p>Question: <b>"+myobj.question+"</b></p>";
	if(myobj.imageUrl != "")
		txt = txt +"<img src='"+HOST+myobj.imageUrl+"' alt='picture question' />";
	
	if(myobj.type == "MULTICHOICE")
	{
		txt = txt +"<p><table width='300' border='1'><tr>"
		txt = txt + "<td>a: "+myobj.options[0]+"</td><td>b: "+myobj.options[1] +"</td></tr>"+
				"<tr><td>c: "+myobj.options[2]+"</td><td>d: "+myobj.options[3] +"</td></tr>"+
				"<tr><td colspan='2'>Select a, b, c, or d</td></tr></table><p>";
	}
	
	return txt;
}

/*
 * Get question categories and subcategories available and update "newgameform" so that a selection
 * can be made
 */
function SetupCategories()
{
	if((jsobj = doAjaxGetJSONObject(QUESTION_URL)) == null) return;
	var catselect = document.getElementById("catoption");
	var cats = new Array();
	Scats = new Array();
	cats = jsobj.categories;
	var option;
	cats.forEach(function (cat)
	{
		option = document.createElement("option");
		option.text = cat.category;
		option.value = cat.category;
		catselect.appendChild(option);
		var subc = new Array();
		var sopt = new Array();
		subc = cat.subCategories;
		subc.forEach(function (sc)
		{
//			sopt.push(sc.subCategory +" ("+sc.numQuestions+")");
			sopt.push(sc);
		});	
		Scats.push(sopt);		
	});
	
}

/*
* This function populates the subcategory field of the form with the
* correct sub cats based on the category selected
*/
function populateSubCat(copt, scopt)
{
	var csel = document.getElementById(copt);
	var scsel = document.getElementById(scopt);
	scsel.innerHTML = "";
	
	var index = csel.selectedIndex;
	Diffs = new Array();
	var subc = new Array();
	subc = Scats[index];
	var option;
//	alert("sub options: "+subc);
	subc.forEach(function (sub)
	{
		option = document.createElement("option");
		option.text = sub.subCategory +" ("+sub.numQuestions+")";
		option.value = sub.subCategory;
		scsel.appendChild(option);		
		var dopt = new Object();
		dopt = sub.difficulty;
		Diffs.push(dopt);
	});
}

/*
 * This function populates the difficulty field of the form with the
 * correct numbers based on the subcategory selected
 */
function populateDiff(scopt, diffopt)
{
	var scsel = document.getElementById(scopt);
	var diffsel = document.getElementById(diffopt);
	diffsel.innerHTML = "";
	
	var index = scsel.selectedIndex;
	var diff = Diffs[index];		// this returns an array
//	console.log("diff options: "+JSON.stringify(diff));
	var option;
	for (var name in diff)
	{
		option = document.createElement("option");
//		console.log("name: "+name+" value: "+diff[name]);
		option.text = name + "("+diff[name]+")";
		option.value = name;
		diffsel.appendChild(option);
	}
/*		var option1 = document.createElement("option");
		option1.text = "HARD("+ diff.HARD + ")";
		option1.value = "HARD";
		diffsel.appendChild(option1);
		var option2 = document.createElement("option");
		option2.text = "MEDIUM("+diff.MEDIUM+")";
		option2.value = "MEDIUM";
		diffsel.appendChild(option2);
		var option3 = document.createElement("option");
		option3.text = "EASY("+diff.EASY+")";
		option3.value = "EASY";
		diffsel.appendChild(option3); */
}

/*
 * Register a new quiz master using API
 */
function QMRegister()
{
	qmform = document.getElementById("qmregisterform");
	qmname = qmform.elements['qmname'].value;
	qmemail = qmform.elements['qmemail'].value;
	qmpassword = qmform.elements['qmpassword'].value;

	var postdata = "qmname="+qmname+"&qmemail="+qmemail+"&qmpassword="+qmpassword;

	var url = QM_URL+"?app_id="+APP_ID;
	var response = doAjaxPostWithBasicAppAuth(url,postdata);
//	alert(response);
	var myobj = JSON.parse(response);
	if(myobj.error != null)		// there was an error response
	{
//		console.log(myobj.error.message+" : "+myobj.error.description);
		document.getElementById("response").innerHTML = myobj.error.description;
		return;
	}
	document.getElementById("response").innerHTML = myobj.quizmasterName+" successfully registered";
//	document.getElementById("response").innerHTML = response;
	
	saveCookie("QMId", myobj.quizmasterId, 1);
	saveCookie("QMName", qmname, 1);
	saveCookie("QMPassword", qmpassword, 1);
}

/*
 * quiz master login/authenticate using API
 */
function QMLogin()
{
	qmform = document.getElementById("qmloginform");
	qmname = qmform.elements['qmname'].value;
	qmpassword = qmform.elements['qmpassword'].value;
//	saveCookie("QMName", qmname);
//	saveCookie("QMPassword", qmpassword);

	var url = QMAUTH_URL+"/quizmaster?app_id="+APP_ID;

	var response = doAjaxGetWithBasicAuth(url,qmname+":"+qmpassword);
//	alert(response);
	var myobj = JSON.parse(response);
	if(myobj.error != null)		// there was an error response
	{
		console.log(myobj.error.message+" : "+myobj.error.description);
		document.getElementById("response").innerHTML = myobj.error.description;
		return;
	}
	var qmid = myobj.user_id;
	var token = myobj.access_token;
	var time = myobj.expires_in;
	saveCookie("QMId", qmid, time);
	saveCookie("QMAccessToken", token, time);
	window.location.assign("showgames.html");
}

/*
 * Check for login cookies and re-direct as appropriate
 */
function IndexPage()
{
	var token = readCookie("QMAccessToken");
	var qmname = readCookie("QMName");
	var qmpassword = readCookie("QMPassword");
	var str;
	
	if(token == null || token == "")	// no access token or has expired
	{
		if(qmname == null || qmname == "")	// no quizmaster name set then ask to login
		{			
			str = "<p>If you are the QuizMaster, <a href='qmlogin.html'>login</a> or <a href='qmregister.html'>register</a> first</p>" +
			"<p>If you are a contestant then <a href='joingame.html'>join game here</a></p>";
			document.getElementById("info").innerHTML = str;
			return;
		}
		else	// token has expired so get another
		{
			var url = QMAUTH_URL+"/quizmaster?app_id="+APP_ID;
			var response = doAjaxGetWithBasicAuth(url,qmname+":"+qmpassword);
//			alert(response);
			var myobj = JSON.parse(response);
			if(myobj.error != null)		// there was an error response
			{
//				console.log(myobj.error.message);
				document.getElementById("response").innerHTML = myobj.error.description;
				return;
			}
			var token = myobj.access_token;
			var time = myobj.expires_in;
			saveCookie("QMAccessToken", token, time);
		}
	}

	window.location.assign("showgames.html");		// redirect to the games page

}

/*
 * logs out current qmaster by deleting all cookies
 */
function Logout()
{	
	delCookie("QMAccessToken");
	delCookie("QMName");
	delCookie("QMPassword");
	delCookie("QMGameID");
	delCookie("QMGameName");
	delCookie("QMContestantID");
	document.getElementById("response").innerHTML = "You have successfully logged out.";

}

/*
 * Get all questions for a game and show them
 */
function ShowGameQuestions()
{
	var gameid = readCookie("QMGameID");
	var url = GAME_URL+"/"+gameid+"/questions";
	if((myobj = doAjaxGetJSONObject(url)) == null) return;

	var qtable = document.getElementById("questiontable");
	var qms = new Array();
	qms = myobj;	// object to array
	for(var i=0; i < qms.length; i++)
	{
		AddRowToQuestionsTable(i+1,qtable,qms[i]);
	}

	document.getElementById("addnewquestions").innerHTML = 
	"<a href='#' onClick='AddnewQuestion("+qms.length+")'>Add another question to this game</a>";
}

/*
 * Add Row To questions table for review
 * used for review questions in a game
 */
function AddRowToQuestionsTable(i,qtable,question)
{
	var row = qtable.insertRow(i);
    var col = row.insertCell(0);
    col.innerHTML = i;
    col = row.insertCell(1);
	col.innerHTML = question.questionId;
    col = row.insertCell(2);
	col.innerHTML = question.category;
    col = row.insertCell(3);
	col.innerHTML = question.subCategory;
    col = row.insertCell(4);
	col.innerHTML = question.difficulty;
    col = row.insertCell(5);
	col.innerHTML = question.type;
    col = row.insertCell(6);
	col.innerHTML = question.question;
    col = row.insertCell(7);
	col.innerHTML = question.answer;
    col = row.insertCell(8);
	if(question.imageUrl == "")
		txt = "n/a";
	else
		txt = "<a href='#' onClick=NewWin('"+HOST+question.imageUrl+"','image')><img src='icons/gpicture40.png'></a>"
 	col.innerHTML = txt;
    col = row.insertCell(9);	
	col.innerHTML = "<a href='#' onClick='ReplaceQuestion("+i+",\""+question.questionId+"\")'><img src='icons/answers40.png' title='Replace'></a>";
    col = row.insertCell(10);
    col.innerHTML = "<a href='#' onClick='DeleteQuestion("+i+",\""+question.questionId+"\")'><img src='icons/trash40.png' title='Delete'></a>";

}

/*
 * Replace one of the questions with another and refresh table
 */
function ReplaceQuestion(qno, qid)
{
	document.getElementById("response").innerHTML = "";
	var newqid = prompt("Please enter the new question id", "e.g. 19710730");
	if(isNaN(newqid))
	{
		alert("invalid question id");
		return;
	}
	if(!newqid)
	{
		return;
	}
	
	var gameid = readCookie("QMGameID");
	var response = doAjaxPut(GAME_URL+"/"+gameid+"/questions/"+qno, "questionid="+newqid);
//	alert(response);
	var myobj = JSON.parse(response);
	if(myobj.error != null)		// there was an error response
	{
		console.log(myobj.error.message);
		document.getElementById("response").innerHTML = myobj.error.description;
		return;
	}
	
	var qtable = document.getElementById("questiontable");
	qtable.deleteRow(qno);
	AddRowToQuestionsTable(qno,qtable,myobj);
//	document.getElementById("response").innerHTML = response;
}

/*
 * Add a new question to the game and refresh table
 */
function AddnewQuestion(numQuestions)
{
	document.getElementById("response").innerHTML = "";
	var newqid = prompt("Please enter the question id of the question to add", "e.g. 19710730");
	if(isNaN(newqid))
	{
		alert("invalid question id");
		return;
	}
	if(!newqid)
	{
		return;
	}
	
	var gameid = readCookie("QMGameID");
	var response = doAjaxPost(GAME_URL+"/"+gameid+"/questions", "questionid="+newqid);
//	alert(response);
	var myobj = JSON.parse(response);
	if(myobj.error != null)		// there was an error response
	{
		console.log(myobj.error.message);
		document.getElementById("response").innerHTML = myobj.error.description;
		return;
	}
	
	var qtable = document.getElementById("questiontable");
	AddRowToQuestionsTable(numQuestions+1,qtable,myobj);
}

/*
 * Delete a question from game and refresh table
 */
function DeleteQuestion(qno, qid)
{
	document.getElementById("response").innerHTML = "";
	var verify = confirm("Are you sure you want to delete this question from this game?");
	if(verify == false)
	{
		return;
	}
	
	var gameid = readCookie("QMGameID");
	var response = doAjaxDelete(GAME_URL+"/"+gameid+"/questions/"+qno);
//	alert(response);
	var myobj = JSON.parse(response);
	if(myobj.error != null)		// there was an error response
	{
		console.log(myobj.error.message);
		document.getElementById("response").innerHTML = myobj.error.description;
		return;
	}
	
//	var qtable = document.getElementById("questiontable");
//	qtable.deleteRow(qno);
//	document.getElementById("response").innerHTML = myobj.success.description;

	location.reload(true);
}

/*
 * Update questions table during review
 * used for reviewing all questions
 */
function UpdateQuestionsTable(i,qtable,question)
{
	var colnum = 0;
	var row = qtable.insertRow(i);
    var col = row.insertCell(colnum++);
	col.innerHTML = question.questionId;
    col = row.insertCell(colnum++);
	col.innerHTML = question.category;
    col = row.insertCell(colnum++);
	col.innerHTML = question.subCategory;
    col = row.insertCell(colnum++);
	col.innerHTML = question.difficulty;
    col = row.insertCell(colnum++);
	col.innerHTML = question.type;
    col = row.insertCell(colnum++);
	col.innerHTML = question.question;
    col = row.insertCell(colnum++);
	col.innerHTML = question.answer;
    col = row.insertCell(colnum++);
	if(question.imageUrl == "")
		txt = "n/a";
	else
		txt = "<a href='#' onClick=NewWin('"+HOST+question.imageUrl+"','image')><img src='icons/gpicture40.png'></a>"
 	col.innerHTML = txt;

}
