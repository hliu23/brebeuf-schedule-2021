function getCourses() {
	return gapi.client.classroom.courses.list({
		"courseStates": "ACTIVE",
		"studentId": "me"
	}).then(function (response) {
		createCourses(response);
	}).catch(function (reason) {
		console.log(reason);
	});
}


function createCourses(response) {
  const courses = response.result.courses;
  
  for (let i = 0; i < courses.length; i++) {
    let aliases = gapi.client.classroom.courses.aliases.list({
      "courseId": courses[i].id
    }).then(function (response) {
      if (response.result.aliases !== undefined) {
        let alias = response.result.aliases[0].alias;
        
        let aliasInfo = alias.match(aliasFormat);
        if (aliasInfo !== null) {
          let period = aliasInfo.groups.period;
          classes[letterToNum(period)] = {
            "name": courses[i].name,
            "semester": aliasInfo.groups.semester
          }

          if (courses[i].section !== undefined) {
            let sectionInfo = courses[i].section.match(sectionFormat);
            if (sectionInfo !== null) {
              classes[letterToNum(period)]["lunch"] = parseInt(info.groups.lunch, 10);
            }
          }
        }
      }

    }).catch(function (reason) {
      console.log(reason);
    });

  }
  return checkExistingCalendar();
}


function letterToNum(letter) {
  return letter.charCodeAt(0) - 65;
}