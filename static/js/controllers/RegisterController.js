module.exports = function($scope, userService, $timeout, $location){
  let {displayStatus, inputsAreFilled} = require('../common/common.js')($scope, $timeout);

  $scope.status = '';
  $scope.register = function(){
    if (!inputsAreFilled(['username', 'password', 'passwordConf', 'calorie_budget'])) return;
    if ($scope.password != $scope.passwordConf){ //already trimmed password
      $scope.status = "Passwords don't match!";
      return;
    }
    $scope.status = 'Registering...';
    userService.register($scope.username, $scope.password, $scope.calorie_budget).success(res=>{
      //console.log(res);
      if (typeof(res) == 'string' && res.slice(0,5) == 'Error'){
        $scope.status = res;
        $timeout(()=>$scope.status='',2500);
      }
      else{
        $scope.status = 'Successfully registered! Redirecting...';
        $timeout(()=>$location.path('/login'),1500);
      }
    });
  };
};
