module.exports = function($scope, userService, $timeout, $location){
  console.log('register controller reporting in');
  $scope.status = '';
  $scope.register = function(){
    $scope.username = $scope.username.trim();
    $scope.password = $scope.password.trim();
    $scope.calorie_budget = $scope.calorie_budget.trim();
    if ($scope.password != $scope.passwordConf){ //already trimmed password
      $scope.status = "Passwords don't match!";
      return;
    }
    if (!$scope.username || !$scope.password || !$scope.calorie_budget ){
      $scope.status = 'Please fill out all fields';
      return;
    })
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
