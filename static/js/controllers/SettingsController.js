module.exports = function($scope, userService){
  console.log('ReportsController reporting in');
  $scope.user = userService.getUserObject();
  $scope.logOut = ()=>userService.logOut();
  $scope.newUserData = {id: $scope.user.id,
                      username: $scope.user.username,
                      calorie_budget: $scope.user.calorie_budget};
  $scope.updateUser = function(){
    if ($scope.newUserData.password){
      //make sure passwords match
      //add password to newUserData
    }
  }
};
