
module.exports = function($http, userService){
  function getAllEntries(){
    if (!userService.isAdmin()) return [];
    return $http.get('entries/');
  }
  function getEntriesByDate(date){
    if (!dateIsValid(date)) return 'Wrong date string';
    else return $http.get('entries/'+date);
  }
  function getEntriesByDateRange(start, end){
    if (!dateIsValid(start) || !dateIsValid(end)) return console.log('Wrong date range!');
    else return $http.get('entries/'+start+'/'+end).success(res=>{
      return res.forEach(entry=>{
        //replace the annoying time string that comes from the server
        entry.date = entry.date.split("T")[0];
      });
    });
  }
  function deleteEntry(id){
    return $http.delete('entries/'+id);
  }
  //receives {date, time, text, calories}
  function addEntry(newEntry){
    newEntry.uid = userService.getUserObject().id;
    return $http.post('entries/', newEntry);
  }
  return {getEntriesByDate, deleteEntry, addEntry, getEntriesByDateRange, getAllEntries};
};

//validates that dateStr is formatted as yyyy-mm-dd or yyy-m-d
function dateIsValid(dateStr){
  if (!dateStr.match(/\d\d\d\d-[0-9]{1,2}-[0-9]{1,2}/)) return false;
  let parts = dateStr.split('-');
  let day = parseInt(parts[2], 10);
  let month = parseInt(parts[1], 10);
  let year = parseInt(parts[0], 10);
  if(year < 1000 || year > 3000 || month == 0 || month > 12)
        return false;
  let monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
  // Adjust for leap years
  if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
      monthLength[1] = 29;
  // Check the range of the day
  return day > 0 && day <= monthLength[month - 1];
}
