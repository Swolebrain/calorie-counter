module.exports = function($scope, userService){
  console.log('ReportsController reporting in');

  $scope.logOut = ()=>userService.logOut();
};
