module.exports = function($scope, $http, userService, entriesService){
  $scope.meals = [];
  $scope.totalCals = 0;
  $scope.totalCalsClass = '';
  $scope.date = getDate(0);
  $scope.dayOffset = 0;
  $scope.user = userService.getUserObject();
  $scope.incDate = function(){
    $scope.dayOffset += 1;
    updateMeals();
  };
  $scope.decDate = function(){
    $scope.dayOffset -= 1;
    updateMeals();
  };
  $scope.updateMeals = updateMeals;
  $scope.deleteMeal = deleteMeal;
  $scope.logOut = logOut;
  updateMeals();

  function deleteMeal(id){
    entriesService.deleteEntry(id).success(res=>{
      updateMeals();
    })
    .error((data, err) => alert("Error communicating with server: "+data));
  }
  //function to update the $scope.meals array
  function updateMeals(){
    $scope.date = getDate($scope.dayOffset);
    entriesService.getEntriesByDate(getDate($scope.dayOffset)).success(res=>{
      $scope.meals = res;
      computeTotalCals();
    })
    .error((data, err)=>alert("Error communicating with server: "+data));
  }
  function computeTotalCals(){
    $scope.totalCals = Array.prototype.reduce.call($scope.meals, (p,c)=>p+Number(c.calories) , 0);
    if ($scope.totalCals > userService.getUserObject().calorie_budget)
      $scope.totalCalsClass = 'text-danger';
    else
      $scope.totalCalsClass = 'text-success';
  }
  function logOut(){
    userService.logOut();
  }
};
/*
Function that returns a properly formatted date string based on a day offset
eg with day offset -1, returns yesterday's date, with day offset +2, returns
the day after tomorrow
*/
function getDate(dayOffset){
  let date = new Date(new Date().getTime() + dayOffset*1000*60*60*24);
  let day = date.getDate();
  let month = date.getMonth()+1;
  let year = date.getFullYear();
  return year+'-'+month+'-'+day;
}
