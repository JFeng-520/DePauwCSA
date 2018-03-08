//create a td with checkbox inserted
//The checkbox will be named as defined.
function createCheckboxTd(name) {
	
	//create a checkbox
	var checkbox = document.createElement("input");
	checkbox.type = "checkbox";
	checkbox.id = name;

	//create a td and insert checkbox
	var td = document.createElement('td');
	td.appendChild(checkbox);

	return td;
}

//insert checkboxes to the search result page.
function insertCheckbox(courseList) {
	
	//locate the huge table which contains the course info.
	var myTrs = document.documentElement.childNodes[2].getElementsByTagName('table')[2].getElementsByTagName('tbody')[0].getElementsByTagName('tr');
	
	//"iterator" of rows. Each row is either a course(lab) or blank.
	var tr;

	//insert a blank td at the first line "Soc# Dept/Crse ....."
	//To make sure the table is still orderly after insert checkbox at the beginning of each row later.
    tr = myTrs[1];
    tr.insertCell(0).innerHTML = "&nbsp;"

	var currentCourseNum;
	//the regex for 4 digit number
	var regex_4_digit = new RegExp("^[0-9][0-9][0-9][0-9]$");

	for (i=2;i<myTrs.length;i++) {
		tr = myTrs[i];
		
		//innertext of the first element in each row has 3 possible value.
		//1. For the rows contain courses, the innerText will the the Soc which is a 4 digit number.
		//2. For the labs, the innerText will be a non-breaking space.
		//3. For the blank rows, the innerText will be empty.
		var innerText = tr.childNodes[0].innerText;
		
		//if this is a blank row, do nothing.
		if(innerText == '') {
			continue;
		}

		//if this is a row contains course information, insert a checkbox at the beginning
		if (regex_4_digit.test(innerText)) {
			currentCourseNum = innerText;
			courseList.push(currentCourseNum);
			//Name the checkbox as <DSA+Soc#>
			var name = 'DSA'+ currentCourseNum;
			tr.insertBefore(createCheckboxTd(name), tr.childNodes[0]);
			//Label this row as <Course+Soc#>, then we can locate this row by Soc# later.
			tr.id = 'Course'+ currentCourseNum;
		} 

		//If this is a row contains lab, then label this row as lab.
		//'\xa0' is non-breaking space which shown as "&nbsp;" in HTML. 
		else if(innerText == '\xa0') {
			tr.insertCell(0).innerHTML = "&nbsp;";
			tr.id = 'Course'+ currentCourseNum + 'Lab';
		}
	}

}

//Count the total credit has been chosen.
function updateTotalCredit() {
	var updateTotalCredit = 0.0;

	//loop through the set of chosen courses and accumulate the credits
	selectedCourses.forEach(function (element, sameElement, set) {  
    	var credit = document.getElementById('Course' + element).getElementsByTagName('td')[4].innerText;
		console.log(typeof credit);
		if(parseFloat(credit) > 0.0) {
			updateTotalCredit += parseFloat(credit);
		}
	}); 
	totalCredit = updateTotalCredit;

	//If more than 5 credits has been chosen, alarm by red color.
	//Or use green color for display.
	if (totalCredit > 5.0) {
		//bright red
		creditColor = '#FF5733';
	} else {
		//light green
		creditColor = '#DAF7A6';
	}
	//For debug
	console.log('Total credit is: ' + totalCredit);
}

//Generate the html code of course info part(a table) in floating box
function updateChosenCourses() {
	updatedCourseInfo = '';
	
	//Put time schedule strings of all the chosen courses into a list.
	time_list = [];
	selectedCourses.forEach(function (element, sameElement, set) {
		time = document.getElementById('Course' + element).getElementsByTagName('td')[5].innerText;
		time_list.push(time);
	});

	//Generate the html code of each tr(row in the table)
	selectedCourses.forEach(function (element, sameElement, set) {  
		//Get course info.
		soc = document.getElementById('Course' + element).getElementsByTagName('td')[1].innerText;
		title = document.getElementById('Course' + element).getElementsByTagName('td')[3].innerText;
		credit = document.getElementById('Course' + element).getElementsByTagName('td')[4].innerText;
		time = document.getElementById('Course' + element).getElementsByTagName('td')[5].innerText;
		dist = document.getElementById('Course' + element).getElementsByTagName('td')[6].innerText;
		cmp = document.getElementById('Course' + element).getElementsByTagName('td')[7].innerText;
        //very light blue
        color = '#EAF2F8';
		count = 0;
		
		//Calculate time conflict against all the time in the list
		for(j=0;j<time_list.length;j++) {
			if(is_time_conflict(time,time_list[j])) {
				count++;
			}
		}
		//Each time schedule will at least conflict with itself.
		//But if it conflicts with more than one time schedule, it must be in a real conflict.
		if(count>1) {
			//light red
			color = '#E6B0AA';
		}

		//Generate the html code of this row.
        tr = '<tr valign="top" style="background-color:' + color + '">' + '<td>' + soc + '</td>'+ '<td>' + title + '</td>'+ '<td>' + credit + '</td>'+ '<td>' + time + '</td>'+ '<td>' + dist + '</td>'+ '<td>' + cmp + '</td></tr>';
		
		//Append this row(tr) to the table
		updatedCourseInfo = updatedCourseInfo + tr;
	});
	courseInfo = updatedCourseInfo;
}

//Judge if two time schedule are conflict.
function is_time_conflict(timeString1, timeString2) {
	//if time is ARR, assert there's no conflict.
	if((timeString1.split(' ').length <= 1) || (timeString2.split(' ').length <= 1)) {
		return false;
	}

	//Time schedule looks like "5:00-7:00 PM T" or "3:00-4:00 MWF"
	//Split by space
	split_time1 = timeString1.split(' ');
	split_time2 = timeString2.split(' ');

	//Get the last element in the list, it should be the day schedule.
	//For example "MWF", "T"
	days1 = split_time1[split_time1.length-1].split('');
	days2 = split_time2[split_time2.length-1].split('');

	//Calculate if the day schedule has overlap.
	//If the day schedule has no overlap, there must be no time conflict.
	has_day_overlap = false;
	console.log(days1.length);
	for (i=0;i<days1.length;i++) {
		day = days1[i];
		if (days2.includes(day)) {
			has_day_overlap = true;	
		}
	}
	if (!has_day_overlap) {
		return false;
	}

	//for example, 8:50 -> 8.5, 15:30 -> 15.3
	time1_start = parseFloat(split_time1[0].split('-')[0].split(':')[0]) + parseFloat(split_time1[0].split('-')[0].split(':')[1])/100;

	time1_end = parseFloat(split_time1[0].split('-')[1].split(':')[0]) + parseFloat(split_time1[0].split('-')[1].split(':')[1])/100;
	
	time2_start = parseFloat(split_time2[0].split('-')[0].split(':')[0]) + parseFloat(split_time2[0].split('-')[0].split(':')[1])/100;

	time2_end = parseFloat(split_time2[0].split('-')[1].split(':')[0]) + parseFloat(split_time2[0].split('-')[1].split(':')[1])/100;

	//If there is PM in the time schedule, add 12.0 to both start time and end time
	if (split_time1[1] == 'PM') {
		time1_start = time1_start +12.0;
		time1_end = time1_end +12.0;
	} 	
	//Else if the start time is smaller than 8.0
	//this must be a afternoon course before we has no lesson early than 8AM
	//for the cases: 3:30-6:00
	else if (time1_start < 8.0) {
		time1_start = time1_start +12.0;
		time1_end = time1_end +12.0;
	}
	//Else if only end time is smaller than 8.0
	//This course must end at afternoon and start in the morning.
	//for the cases: 11:30-2:30
	else if (time1_end < 8.0) {
		time1_end = time1_end +12.0;
	}

	//Same for the time2.
	if (split_time2[1] == 'PM') {
		time2_start = time2_start +12.0;
		time2_end = time2_end +12.0;
	} 	
	else if (time2_start < 8.0) {
		time2_start = time2_start +12.0;
		time2_end = time2_end +12.0;
	}   
	else if (time2_end < 8.0) {
		time2_end = time2_end +12.0;
	}

	//If start time or end time is same, there must be time conflict.
	if ((time1_start == time2_start) || (time1_end == time2_end)) {
		return true;
	}

	//Check if there's time overlap.
	if (time1_start < time2_start) {
		if (time1_end <= time2_start) {
			return false;
		} else {
			return true;
		}
	} else {
		if (time2_end <= time1_start) {
			return false;
		} else {
			return true;
		}
	}
}

//When user click the checkbox, update the floating box.
function monitor_checkbox(num) {
	var id = '#DSA' + num;
	var courseNum = '';
	courseNum = num;

	jQuery(id).change(function() {
		if(this.checked) {
			selectedCourses.add(courseNum);
			//If this course has lab, add lab as well to chosen course list
			if (document.getElementById('Course'+ courseNum + 'Lab') != null) {
				selectedCourses.add(courseNum + 'Lab');
			}
		} else {
			selectedCourses.delete(courseNum);
			//If this course has lab, delete lab as well from chosen course list
			if (selectedCourses.has(courseNum + 'Lab')) {
				selectedCourses.delete(courseNum + 'Lab');
			}
		}
		//update the floating box
		updateFloatingBox();
	});
}

//refresh the floating box without refreshing the whole page.
//Enabled by jQuery
function updateFloatingBox() {

	//update variable: totalCredit and creditColor
	//totalCredit is integer
	//creditColor is RGB string like '#EAF2F8'
	updateTotalCredit();

	//update variable: courseInfo
	//courseInfo is html code of the course info part in floating box.
	updateChosenCourses();

	//html code of the whole floating box.
	//variables: creditColor, totalCredit, courseInfo. 
	$("#floating_box").html('<div id="floating_box_content" style="margin:0px;width:80%;z-index: 9999;position: fixed;top:5px;right:0px;border:1px solid gray;text-align: center;"><div id="total_credit" style="height:20px;font-size: 12px;line-height:20px;background:'+ creditColor +';">TotalCredit Chosen: ' + totalCredit + '</div><div id="floating_time_table" style="background-color:white"><table border="1" cellspacing="0" width="100%"><tbody><tr><td bgcolor="#eeeeee" valign="bottom">Soc#</td><td bgcolor="#eeeeee" valign="bottom">Title</td><td bgcolor="#eeeeee" valign="bottom">Credit</td><td bgcolor="#eeeeee" valign="bottom">Time</td><td bgcolor="#eeeeee" valign="bottom">Dist</td><td bgcolor="#eeeeee" valign="bottom">Cmp</td></tr>' + courseInfo + '</tbody></table></div></div>');
	
}
const selectedCourses = new Set();
var totalCredit = 0.0;
//default light green;
var creditColor = '#DAF7A6';
var courseInfo = '';

//The main function
$(document).ready(function () {
	var courseList = [];
    
    //Insert checkboxes by jQuery, it may take up to 20s if we are loading the whole table for this semester.
    console.log('Inserting checkboxes...');
    insertCheckbox(courseList);
		
	//Program all the checkboxes, set the triggers.
	courseList.forEach(function(entry) {
    	monitor_checkbox(entry);
	});

	//Insert a blank area for the floating box. To make sure it won't cover useful information.
	blank = jQuery('<div id="blank" style="height:200px;"></div>');
	jQuery("body").prepend(blank);

	//Insert a blank floating box, will refresh it when there is checkbox related activity.
    floating_box = jQuery('<div id="floating_box" </div>');
    jQuery("body").prepend(floating_box);

	//Initialize the floating box.
	updateFloatingBox();

});

