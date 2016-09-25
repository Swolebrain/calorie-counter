module.exports = function($scope, userService, $timeout, $location){
  $scope.status = '';
  $scope.auth = function(){
    if (!inputsAreFilled()) return;
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


  function displayStatus(status){

    $timeout(()=>$scope.status='',2500);
  }
  function inputsAreFilled(){
    if (!$scope.username || !$scope.password){
      displayStatus('Please fill out all fields');
      return false;
    }
    $scope.username = $scope.username.trim();
    $scope.password = $scope.password.trim();
    //check again after removing whitespace
    if (!$scope.username || !$scope.password){
      return displayStatus('Please fill out all fields');
      return false;
    }
    return true;
  }
};
