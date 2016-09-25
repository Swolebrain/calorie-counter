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
        if (!isValidCalories(scope.newEntry.calories) || !scope.newEntry.text || !isValidTime(scope.newEntry.time)){
          scope.status = 'Some fields are incorrect';
          $timeout(()=>scope.status='',2500);
          return;
        }
        entriesService.addEntry(scope.newEntry).success(res=>{
          if (res.insertId){
            scope.status = 'Insertion succeeded!';
            scope.updateMeals();
            $timeout(()=>{
              scope.status='';
              scope.newEntry.calories = '';
              scope.newEntry.text = '';
              scope.newEntry.time = '';
            },2500);
          }
          console.log(res);
        })
        .error((data, status)=>{
          alert('Something went wrong when connecting to the server');
        });
      }
    }
  };
};

function isValidTime(timeStr){
  timeStr = timeStr.trim();
  if (timeStr.length == 0) return false;
  let time = timeStr.split(':');
  if (time.length != 3) return false;
  let hours = parseInt(time[0],10);
  let minutes = parseInt(time[1],10);
  let ampm = time[2].toLowerCase();
  return hours < 12 && hours >= 0 && minutes >= 0 && minutes < 60 && (ampm =='am' || ampm == 'pm');
}

function isValidCalories(cals){
  return Number(cals) == cals;
}
