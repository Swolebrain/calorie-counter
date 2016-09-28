module.exports = function($scope, userService, $timeout, $location){
  let {displayStatus, inputsAreFilled} = require('../common/common.js')($scope, $timeout);
  $scope.status = '';
  $scope.auth = function(){
    if (!inputsAreFilled(['username', 'password'])) return;
    $scope.status = 'Logging in...';
    userService.authenticate($scope.username, $scope.password).success(res=>{
      if (res.data)
        $scope.status = res.data;
      else
        $scope.status = res;
      if (typeof(res) == 'string' && res.slice(0,5) == 'Error'){
        return $timeout(()=>$scope.status='',2500);
      }
      //successfully logged in, redirect to /
      if (userService.isAdmin()) return $location.path('/admin');
      else if (userService.isUserAdmin()) return $location.path('/user-admin');
      else $location.path('/');
    });
  };

};
