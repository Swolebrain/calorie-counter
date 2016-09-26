module.exports = function($timeout, entriesService){
  return {
    restrict: 'E',
    scope:{
      date: '=',
      updateMeals : '&'
    },
    templateUrl: 'js/directives/newMealDirective.html',
    link: function(scope, elem, attrs){
      scope.newEntry = {};
      scope.status = '';
      scope.createMeal = function(){
        scope.newEntry.date = scope.date;
        let validationError = findInputErrors(scope.newEntry.calories, scope.newEntry.text, scope.newEntry.time);
        if (validationError){
          scope.status = validationError;
          $timeout(()=>scope.status='',2500);
          return;
        }
        entriesService.addEntry(scope.newEntry).success(res=>{
          if (res.insertId){
            scope.status = 'Insertion succeeded!';
            scope.updateMeals();
            scope.newEntry.calories = '';
            scope.newEntry.text = '';
            scope.newEntry.time = '';
            $timeout(()=>{
              scope.status='';
            },2500);
          }
        })
        .error((data, status)=>{
          alert('Something went wrong when connecting to the server');
        });
      }
    }
  };
};

function isValidTime(timeStr){
  if(!timeStr || timeStr.length < 2) return false;
  timeStr = (""+timeStr).trim();
  let time = timeStr.split(':');
  if (time.length != 3) return false;
  let hours = parseInt(time[0],10);
  let minutes = parseInt(time[1],10);
  let ampm = time[2].toLowerCase();
  return hours <= 12 && hours >= 0 && minutes >= 0 && minutes < 60 && (ampm =='am' || ampm == 'pm');
}

function isValidCalories(cals){
  if (!cals) return false;
  return Number(cals) == cals;
}
//!isValidCalories(scope.newEntry.calories) || !scope.newEntry.text ||
function findInputErrors(cals,text,time){
  if (!isValidTime(time)) return "Invalid Time entry";
  if (!text) return "Invalid description";
  if (!isValidCalories(cals)) return "Invalid calorie entry"
  return false;
}
