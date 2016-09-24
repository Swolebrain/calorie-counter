module.exports = function($scope, userService, $timeout, $location){
  console.log('register controller reporting in');
  $scope.status = '';
  $scope.register = function(){
    if ($scope.password != $scope.passwordConf){
      $scope.status = "Passwords don't match!";
      return;
    }
    $scope.status = 'Registering...';
    userService.register($scope.username, $scope.password, $scope.calorie_budget).success(res=>{
      if (res.data)
        $scope.status = res.data;
      else {
        $scope.status = res;
      }
      if (typeof(res) == 'string' && res.slice(0,5) == 'Error'){
        $timeout(()=>$scope.status='',2500);
      }
      else{
        window.location = userService.authRedirect;
      }
    }).error((data, status)=>{
      $scope.status = 'Failed connecting to server. '+data+' '+status;
    });
  };
};
