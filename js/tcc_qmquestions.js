/*
 * Get questions based on category, subcat and difficulty
 */
function reviewquestions()
{
	var qform = document.getElementById("questionform");
	var cat = qform.elements["catoption"].value;
	var scat = qform.elements["scoption"].value;
	var diff = qform.elements["diffoption"].value;

	var data = "category="+cat+"&subcategory="+scat+"&difficulty="+diff;
	NewWin("questions.html?"+data, "Review Questions");
}

/*
 * Get the first question based on category sub cat and difficulty and populate table
 */
function showfirstquestions()
{
	var myobj;
	var cat = getParameterByName("category");
	var scat = getParameterByName("subcategory");
	var diff = getParameterByName("difficulty");
	var limit = 6;
	var offset = 0;
	showquestions(cat,scat,diff,limit,offset);
}

/*
 * Get the actual questions based on category sub cat and difficulty and populate table
 */
function showquestions(cat,scat,diff,limit,offset)
{	
	var url = QUESTION_URL+"category/"+cat+"?subcategory="+scat+"&difficulty="+diff+"&limit="+limit+"&offset="+offset;
//	alert(url);
	if((myobj = doAjaxGetJSONObject(url)) == null) return;

	var qtable = document.getElementById("questiontable");
	var qms = new Array();
	qms = myobj.questions;	// object to array
	var i;
	var tablelen = qtable.rows.length;
//	alert("table size "+tablelen);
	for(i=tablelen-1; i > 0; i--)	// delete existing table rows if exists
	{
		qtable.deleteRow(i);
	}
	for(i=0; i < qms.length; i++)
	{
		UpdateQuestionsTable(i+1,qtable,qms[i]);
	}
	
	var newoff = parseInt(offset) + parseInt(limit);
	var max = parseInt(myobj.total);
	var preoff = parseInt(offset) - parseInt(limit);	// previous
	var start = parseInt(offset) + 1;
	var end = start -1 + parseInt(myobj.numQuestions);
	
	var next = "\""+cat+"\",\""+scat+"\",\""+diff+"\",\""+limit+"\",\""+newoff+"\"";
	var previous = "\""+cat+"\",\""+scat+"\",\""+diff+"\",\""+limit+"\",\""+preoff+"\"";
//	alert("next is "+next);
//	alert("newoff:"+newoff+" tot-num:"+max);

	txt = "Questions "+start+" to "+end+" of "+myobj.total+" - ";
	if(preoff < 0)	// previous negative means we are on first page
	{
		txt = txt+"Previous ";	
	}
	else
	{
		txt = txt+"<a href='#' onClick='showquestions("+previous+")'>Previous</a>&nbsp;";	
	}
	
	if(end >= max)	// if next is greater than max available we are at last page
	{
		txt = txt+ " Next";
	}
	else
	{
		txt = txt + "<a href='#' onClick='showquestions("+next+")'> Next</a>";
	}
	
	document.getElementById("next").innerHTML = txt;

}


/*
 * Get the next questions in list
 */
function nextquestions()
{
	
}
