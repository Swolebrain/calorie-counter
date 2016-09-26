module.exports = function($scope, userService, $timeout, entriesService){
  const displayStatus = require('../common/common.js')($scope, $timeout).displayStatus;
  $scope.logOut = ()=>userService.logOut();
  $scope.summaryEntries = [];
  $scope.showReport = function(){
    let {formStartDate:startDate, formEndDate: endDate,
      formStartTime: startTime, formEndTime: endTime} = $scope;
    if (!endTime) endTime = '23:59:pm';
    if (!startTime) startTime = '00:00:am';
    if (!startDate || !endDate){
      return displayStatus('Please select at least start and end dates')
    }
    startDate = formatDate(startDate);
    endDate = formatDate(endDate);
    startTime = formatTime(startTime);
    endTime = formatTime(endTime);
    entriesService.getEntriesByDateRange(startDate, endDate).then(res=>{
      $scope.summaryEntries = [];
      //here we filter by start time and end time
      let ctr = 0;
      for (var day = new Date(startDate); day <= new Date(endDate); day.setDate(day.getDate()+1)){
        let daysEntries = Array.prototype.filter.call(res.data, entry=>new Date(entry.date).getDate()==day.getDate());
        console.log(daysEntries);
        if (daysEntries.length > 0){
          let summaryCals = daysEntries.reduce((p,c)=>p+getCalories(c,startTime,endTime), 0);
          $scope.summaryEntries.push({date: daysEntries[0].date, calories: summaryCals});
        }

        if (ctr++ > 100) break; //infinite loop protection
      }
    });
  };
};

function formatDate(timeStr){
  if (!timeStr) return;
  let time = new Date(timeStr);
  let year = time.getFullYear();
  let day = ("0"+time.getDate()).slice(-2);
  let month = ("0"+(time.getMonth()+1)).slice(-2);
  return year+'-'+month+'-'+day;
}

function formatTime(timeStr){
  if (!timeStr) return;
  if (timeStr.match && timeStr.match(/\d\d:\d\d:[ap]m/)) return timeStr;
  let time = new Date(timeStr);
  let hour = time.getHours();
  let ampm = 'am';
  if (hour >= 12){
    ampm = 'pm';
    if (hour > 12 ) hour = hour % 12;
  }
  let minutes = ("0"+time.getMinutes()).slice(-2);
  return hour+":"+minutes+":"+ampm;
}
/*
  Aux function to access the calories from an entry.
  Returns 0 if entry is not within startTime and endTime
*/
function getCalories(entry, startTime, endTime){
  //console.log(`Seeing if ${entry.time} is within ${startTime} and ${endTime}`);
  let entryTime = convertToMilitaryTime(entry.time.split(":"));
  startTime = convertToMilitaryTime(startTime.split(":"));
  endTime = convertToMilitaryTime(endTime.split(":"));
  //console.log(`Seeing if ${entryTime} is within ${startTime} and ${endTime}`);
  if (entryTime >= startTime && entryTime <= endTime){
    //console.log('returning '+entry.calories);
    return entry.calories;
  }
  else {
    //console.log('returning 0');
    return 0;
  }
}

function convertToMilitaryTime(timeArr){
  let ret;
  if (timeArr[2] == 'pm' && Number(timeArr[0]) < 12)
    ret = (12+ Number(timeArr[0]))+":"+ ("0"+timeArr[1]).slice(-2);
  else ret = ("0"+timeArr[0]).slice(-2) + ":" + ("0"+timeArr[1]).slice(-2);
  return ret;
}
