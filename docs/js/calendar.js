function createCalendar() {
  var localStorage = window.localStorage;
  var calendarId = localStorage.getItem("brebeufScheduleCalendar");

  if (calendarId !== null) {
    var del = gapi.client.calendar.calendars.delete({
      "calendarId": calendarId
    }).then(function (response) {
      calendarId = null;
      localStorage.removeItem("brebeufScheduleCalendar");

    }).catch(function (reason){
      console.log(reason);
      calendarId = null;
      localStorage.removeItem("brebeufScheduleCalendar");
    })
  }

  // calendar color and alert
  if (calendarId === null) {
    var calendar = gapi.client.calendar.calendars.insert({
      "resource": {
        "summary": "Brebeuf Schedule",
        "description": "Generated on " + new Date().toLocaleString(),
        "timeZone": "America/Indiana/Indianapolis"
      }
    }).then(function (response) {
      calendarId = response.result.id;
      localStorage.setItem("brebeufScheduleCalendar", calendarId);
      return batchEvents(calendarId);
      
    }).catch(function (reason) {
      console.log(reason);
      localStorage.removeItem("brebeufScheduleCalendar");
    });
  }
  
}


function batchEvents(calendarId) {
  const batch = gapi.client.newBatch();

  var dayTest = new Date();
  dayTest.setHours(0, 0, 0, 0);
  var endDate = specialDates.lastDay;

  while (dayTest.getTime() <= endDate.getTime()) {
    var bDay = brebeufDay(dayTest);
    if (bDay !== null) {
      var classesOrder = classOrder[bDay-1];

      for (let classOfDay = 0; classOfDay < classesOrder.length; classOfDay++) {
        let periodNum = classesOrder[classOfDay];
        let eventClass = classes[periodNum-1];

        if (eventClass !== null) {
          let lunch = eventClass.lunch;
          let startTime = new Date(dayTest);
          let endTime = new Date(dayTest);

          // difference in alt schedule here
          let schedule = normalSchedule[classOfDay];
          let eventNum = 1;

          if (classOfDay === 2) {
            schedule = schedule[lunch-1];
            if (lunch === 2) eventNum = 2;
          }

          for (let i = 0; i < eventNum; i++) {
            if (i !== 1) {
              startTime.setHours(schedule[0], schedule[1]);
              endTime.setHours(schedule[2], schedule[3]);
            } else {
              startTime.setHours(schedule[4], schedule[5]);
              endTime.setHours(schedule[6], schedule[7]);
            } 
            const event = gapi.client.calendar.events.insert({
              "calendarId": calendarId,
              "resource": createEvent(eventClass.name, periodNum, startTime, endTime) 
            });
            batch.add(event);
          }
        }
      }
    }
    dayTest.setDate(dayTest.getDate() + 1);
  }
  return batch
  .then(function (response) {
    console.log(response.result);
  }).catch(function (reason) {
    console.log(reason);
  });
}
// clear, lunch, color

function brebeufDay(enteredDate) {
  // enter date object
  enteredDate.setHours(0,0,0,0);
  const enteredTime = enteredDate.getTime();
  var dayOne = specialDates.firstDayFirstSem;
  if (enteredTime >= specialDates.firstDaySecondSem.getTime()) dayOne = specialDates.firstDaySecondSem;
  
  var brebeufDay = null;
  if (enteredTime == dayOne.getTime()) brebeufDay = 1;
  else if (enteredTime < dayOne.getTime() || enteredTime > specialDates.lastDay.getTime()) brebeufDay = null;
  else if (!normalDay(enteredDate)) brebeufDay = null;
  else {
    var dayCount = 0;
    var dayTest = new Date(dayOne);

    while (dayTest.getTime() <= enteredTime) {
      if (normalDay(dayTest)) dayCount ++;
      dayTest.setDate(dayTest.getDate() + 1);
    }
    brebeufDay = dayCount % 8;
    if (brebeufDay == 0) brebeufDay = 8;
  }

  return brebeufDay;
}


function normalDay(enteredDate) {
  // enter date object
  var normal = true;
  const enteredTime = enteredDate.getTime();
  if (enteredDate.getDay() == 6 || enteredDate.getDay() == 0) normal = false;
  else {
    for (let days of specialDates.singleDays) {
      if (enteredTime == days.getTime()) {
        normal = false;
        break;
      }
    }
    if (normal) {
      for (let breaks of specialDates.extendedBreak) {
        if (enteredTime >= breaks[0].getTime() && enteredTime <= breaks[1].getTime()) {
          normal = false;
          break;
        }
      }
    }
  }
  return normal;
}


function createEvent(summary, color, firstDate, secondDate) {
  // pass in date objects
  var event = {
    "summary": summary,
    "colorId": color,
    "start": {
      "dateTime": firstDate.toISOString(),
      "timeZone": "America/Indiana/Indianapolis"
    },
    "end": {
      "dateTime": secondDate.toISOString(),
      "timeZone": "America/Indiana/Indianapolis"
    }
  };
  return event;
}