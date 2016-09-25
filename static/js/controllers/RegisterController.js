module.exports = function($scope, userService, $timeout, $location){
  console.log('register controller reporting in');
  $scope.status = '';
  $scope.register = function(){
    let u = $scope.username.toString().trim();
    let p = $scope.password.toString().trim();
    let calorie_budget = $scope.calorie_budget.toString().trim();
    if (p != $scope.passwordConf){ //already trimmed password
      $scope.status = "Passwords don't match!";
      return;
    }
    if (!u || !p || !calorie_budget ){
      $scope.status = 'Please fill out all fields';
      return;
    }
    $scope.status = 'Registering...';
    userService.register(u, p, calorie_budget).success(res=>{
      console.log(res);
      if (typeof(res) == 'string' && res.slice(0,5) == 'Error'){
        $scope.status = res;
        $timeout(()=>$scope.status='',2500);
      }
      else{
        //successfully logged in, redirect to /
        $location.path('/');
      }
    });
  };
};
