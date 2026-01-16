generate = document.getElementById('chart_button');
calendar = document.getElementById('calendar');
start_time_btn = document.getElementById('start_time');
end_time_btn = document.getElementById('end_time');
month_up = document.getElementById('month_up');
month_down = document.getElementById('month_down');
calendar_popover = document.getElementById('calendar');

let from_or_to = 3;
let chosenDate = null;

const monthList = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const monthLen = [31,28,31,30,31,30,31,31,30,31,30,31];

currentDate = new Date();
document.getElementById('year_input').innerHTML = currentDate.getFullYear().toString();
currentYear = document.getElementById('year_input').innerHTML;
let currentMonth = currentDate.getMonth();
let currentDay = currentDate.getDate();
date_elements = document.getElementsByClassName('date');

function convert_weekday(weekday){
    if (weekday === 0) {
        weekday = 7
    }
    return weekday-1;
}

document.getElementById('year_input').innerHTML = currentYear;
document.getElementById('month_input').innerHTML = monthList[currentMonth];

document.getElementById('submit_date').addEventListener('click', function(){
    if (from_or_to === 0) {
        document.getElementById('date_visual_1').innerHTML = currentYear+'-'+monthList[currentMonth]+'-'+get_chosen_Date().innerHTML;
    }
    if (from_or_to === 1) {
        document.getElementById('date_visual_2').innerHTML = currentYear+'-'+monthList[currentMonth]+'-'+get_chosen_Date().innerHTML;
    }
    calendar_popover.hidePopover();
});

document.addEventListener('click', function(event) {
    let et = event.target;
    if (et.className === 'date' && et.innerHTML !== '') {
        let prev_date = get_chosen_Date();
        currentDay = (et.innerHTML);
        setDateColor(et.innerHTML);
        if (prev_date.innerHTML !== null) {
            prev_date.style.backgroundColor = 'rgba(0, 0, 0, 0.49)';
        }
        else {
            prev_date.style.backgroundColor = 'white';
        }

    }
    if (leapYear(currentYear)){
        monthLen[1] = 29;
    }
    else {
        monthLen[1] = 28;
    }
    if (et.id === 'month_down') {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
        }
        let weekday = convert_weekday(new Date(parseInt(currentYear), currentMonth, 1).getDay());
        reloadCalendar(currentMonth,monthLen[currentMonth],weekday);

        if (currentMonth < 0) {
            currentMonth = 11;
            document.getElementById('month_input').innerHTML = monthList[currentMonth];
        }
        document.getElementById('month_input').innerHTML = monthList[currentMonth];
    }
    else if (et.id === 'month_up') {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
        }
        let weekday = convert_weekday(new Date(parseInt(currentYear), currentMonth, 1).getDay());
        reloadCalendar(currentMonth,monthLen[currentMonth],weekday);
        document.getElementById('month_input').innerHTML = monthList[currentMonth];

    }
    if (et.id === 'year_down') {
        currentYear--;
        if (leapYear(currentYear)){
            monthLen[1] = 29;
        }
        else {
            monthLen[1] = 28;
        }
        let weekday = convert_weekday(new Date(parseInt(currentYear), currentMonth, 1).getDay())
        reloadCalendar(currentMonth,monthLen[currentMonth],weekday);
        document.getElementById('year_input').innerHTML = currentYear;

    }
    else if (et.id === 'year_up') {
        currentYear++;
        if (leapYear(currentYear)){
            monthLen[1] = 29;
        }
        else {
            monthLen[1] = 28;
        }
        let weekday = convert_weekday(new Date(parseInt(currentYear), currentMonth, 1).getDay());
        reloadCalendar(currentMonth,monthLen[currentMonth],weekday);
        document.getElementById('year_input').innerHTML = currentYear;
    }
    if (et.id === 'start_time') {
        from_or_to = 0;
    }
    else if (et.id === 'end_time') {
        from_or_to = 1;
    }
}, false);

generate.addEventListener('click', function(){
    fetch('getGraphData', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
            graph: document.getElementById('choose_chart').value,
            x_axis: document.getElementById('x_axis_choice').value,
            y_axis: document.getElementById('y_axis_choice').value,
            from: document.getElementById('date_visual_2').innerHTML,
            to: document.getElementById('date_visual_2').innerHTML
        })
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then((data) => {
        document.getElementById('myChart').remove()
        document.getElementById('chart_wrapper').innerHTML = '<canvas id="myChart"></canvas>'
        if (data['chart_type'] === 'pie') {
            document.getElementById('chart_wrapper').style.width = '35vw';
        }
        else {
            document.getElementById('chart_wrapper').style.width = '70vw';
        }
        the_chart(data.list,data.data,data.description,data['chart_type']);
    })
    .catch((fetchError) => {
        console.error('There was a problem with the fetch operation: ', fetchError);
    });
});

function setDateColor (date) {
    for (let i = 0; i < date_elements.length; i++) {
        if (date_elements[i].innerHTML === date) {
            date_elements[i].style.backgroundColor = 'blue';
            chosenDate = date_elements[i].innerHTML;
            break;
        }
    }
}
function get_chosen_Date () {
    for (let i = 0; i < date_elements.length; i++) {
        if (date_elements[i].style.backgroundColor === 'blue') {
            chosenDate = date_elements[i];
            return chosenDate;
        }
    }
    return null;
}
function get_outer_Months(initial_month,initial_day) {
    let prevmonth = 0;
    let nextmonth = 0;
    console.log(initial_month);
    if (initial_month === 11) {
        prevmonth = 10;
        nextmonth = 0;
    }
    else if (initial_month === 0) {
        prevmonth = 11;
        nextmonth = 1;
    }
    else {
        prevmonth = currentMonth-1;
        nextmonth = currentMonth+1;
    }
    let prev_len = monthLen[prevmonth]
    let next_weekday = convert_weekday(new Date(parseInt(currentYear), prevmonth, 1).getDay());
    return [prev_len,next_weekday];
}

function loadCalendar(current_month,month_len,initial_day) {
    let outer = get_outer_Months(current_month,initial_day);
    for (let i=0;i<42; i++) {
        let div = document.createElement('div');
        div.className = 'date';
        if (i<initial_day) {
            div.innerHTML = (i+outer[0]-initial_day+1).toString();
        }
        else if (i>=initial_day && i<=month_len+initial_day-1) {
            div.innerHTML = (i-initial_day+1).toString();
        }
        else {
            div.innerHTML = (i-43+10).toString();
            div.classList.add('date_hover');
            div.style.backgroundColor = 'red';
        }
        document.getElementById('calendar_wrapper').append(div);
    }
}
function reloadCalendar(current_month,month_len,initial_day) {
    let date_elements = document.getElementsByClassName('date');
    let outer = get_outer_Months(current_month,initial_day);

    for (let i=0;i<date_elements.length; i++) {
        if (i>=initial_day && i<=month_len+initial_day-1) {
            date_elements[i].classList.remove('date_hover');
            date_elements[i].style.backgroundColor = 'rgba(0, 0, 0, 0.49)';
            date_elements[i].innerHTML = (i-initial_day+1).toString();
            if (date_elements[i].innerHTML === chosenDate) {
                setDateColor(chosenDate);
            }
        }
        else if (i<initial_day) {
            date_elements[i].classList.add('date_hover');
            date_elements[i].style.backgroundColor = 'red';
            date_elements[i].innerHTML = (i+outer[0]-initial_day+1).toString();
            if (date_elements[i].innerHTML === chosenDate) {
                setDateColor(chosenDate);
            }
        }
        else {
            date_elements[i].innerHTML = (i-43+10).toString();
            date_elements[i].classList.add('date_hover');
            date_elements[i].style.backgroundColor = 'red';
        }
    }
}
function leapYear(year)
{
    return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
}

let weekday = convert_weekday(new Date(parseInt(currentYear), currentMonth, 1).getDay());
loadCalendar(currentMonth,monthLen[currentMonth],weekday);
setDateColor(currentDay.toString());
if (leapYear(document.getElementById('year_input').innerHTML)) {
    monthLen[1] = 29
}
else {
    monthLen[1] = 28;
}


/**
  TODO:
  Could do something over span of last 3 months give me the count of total server calls
  Total num of users
  add additional step to define if to split by day, month or year, depending on user preference
*/