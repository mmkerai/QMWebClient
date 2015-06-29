
/*
 * View all quizmasters on this app id
 */
function QMAppView()
{
	var url = QM_URL+"?app_id="+APP_ID;
	var response = doAjaxGetWithBasicAppAuth(url);
//	alert(response);
	var myobj = JSON.parse(response);
	if(myobj.error != null)		// there was an error response
	{
//		console.log(myobj.error.message+" : "+myobj.error.description);
		document.getElementById("response").innerHTML = myobj.error.description;
		return;
	}
	var qmtable = document.getElementById("contestanttable");
	var qms = new Array();
	qms = myobj.quizmasters;
	for(cnt = 0; cnt < myobj.numQuizmasters; cnt++)
	{
		AddRowToQMasterTable(cnt,qmtable,qms);
	}
}

/*
 * Get quizmaster details and fill form so it can be edited
 */
function GetQMEdit()
{
	var qmid = readCookie("QMID");
	if(qmid == null)
	{
		alert("QM id not found");
		return;
	}
		
	var url = QM_URL+"/"+qmid+"?app_id="+APP_ID;
	alert("url is "+url);
	var response = doAjaxGetWithBasicAppAuth(url);
//	alert(response);
	var myobj = JSON.parse(response);
	if(myobj.error != null)		// there was an error response
	{
//		console.log(myobj.error.message+" : "+myobj.error.description);
		document.getElementById("response").innerHTML = myobj.error.description;
		return;
	}
	document.getElementById("title").innerHTML = "Edit Quizmaster "+myobj.quizmasterName;
	var qform = document.getElementById("qmregisterform");
	qform.elements["quizmasterid"].value = qmid;
	qform.elements["qmname"].value = myobj.quizmasterName;
//	qform.elements["qmpassword"].value = myobj.accessCode;
	qform.elements["qmemail"].value = myobj.quizmasterEmail;
}

/*
 * update quizmaster details by sending PUT message
 */
function QMasterUpdate()
{
	var qform = document.getElementById("qmregisterform");
	var qmid = qform.elements["quizmasterid"].value;
	var qmname = qform.elements["qmname"].value;
	var qmpwd = qform.elements["qmpassword"].value;
	var qmemail = qform.elements["qmemail"].value;
	var putdata = "qmname="+qmname+"&qmpassword="+qmpwd+"&qmemail="+qmemail;

	var url = QM_URL+"/"+qmid+"?app_id="+APP_ID;
	var response = doAjaxPutWithBasicAppAuth(url, putdata);
//	alert(response);
	var myobj = JSON.parse(response);
	if(myobj.error != null)		// there was an error response
	{
//		console.log(myobj.error.message+" : "+myobj.error.description);
		document.getElementById("response").innerHTML = myobj.error.description;
		return;
	}
	document.getElementById("response").innerHTML = myobj.quizmasterName+" updated successfully";
//	document.getElementById("response").innerHTML = response;
}

/*
 * Delete quizmaster. can only be done by app
 */
function DeleteQuizmaster(qmid, qmname)
{
	if(confirm("Are you sure you want to delete "+qmname) == false)
		return;
		
	var url = QM_URL+"/"+qmid+"?app_id="+APP_ID;
	var response = doAjaxDeleteWithBasicAppAuth(url);
	var myobj = JSON.parse(response);
	if(myobj.error != null)		// there was an error response
	{
//		console.log(myobj.error.message);
		document.getElementById("response").innerHTML = myobj.error.description;
		return;
	}
	
	document.getElementById("response").innerHTML = myobj.success.description;
	alert("Quizmaster "+qmname+" deleted");
	window.location.reload();
}

/*
 * Populate quizmasters table for this app
 */
function AddRowToQMasterTable(cnt,table,qms)
{
	var row = table.insertRow(cnt+1);	// there is already a header row
    var col1 = row.insertCell(0);
    col1.innerHTML = qms[cnt].quizmasterName;
    var col2 = row.insertCell(1);
    col2.innerHTML = qms[cnt].quizmasterEmail;
    var col3 = row.insertCell(2);
    col3.innerHTML = qms[cnt].lastLogin;
    var col4 = row.insertCell(3);
    col4.innerHTML = qms[cnt].lastIPAddr;
    var col5 = row.insertCell(4);
    col5.innerHTML = "<a href='#' onClick=EditQMSetup('"+qms[cnt].quizmasterId+"','"+qms[cnt].quizmasterName+"')><img src='icons/gears40.png' title='Edit'></a>";
    var col6 = row.insertCell(5);
    col6.innerHTML = "<a href='#' onClick=DeleteQuizmaster('"+qms[cnt].quizmasterId+"','"+qms[cnt].quizmasterName+"')><img src='icons/trash40.png' title='Delete'></a>";
}

/*
 * Front end edit qmaster details
 */
function EditQMSetup(id, name)
{
	saveCookie("QMID", id, 1);
	NewWin("qmappedit.html", "Edit Quizmaster "+name);
}
