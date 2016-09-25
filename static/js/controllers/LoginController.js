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
        $timeout(()=>$scope.status='',2500);
      }
      else{
        //successfully logged in, redirect to /
        $location.path('/');
      }
    });
    // .error((data, status)=>{
    //   $scope.status = 'Failed connecting to server. '+data+' '+status;
    // });
  };

};
