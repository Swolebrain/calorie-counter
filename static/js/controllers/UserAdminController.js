module.exports = function($scope, userService, entriesService, $timeout){
  $scope.newUser = {role: 'user'};
  $scope.create = createUser;
  $scope.logOut = ()=>userService.logOut();

  function createUser(){
    $scope.status = 'Registering...';
    let {username, password, calorie_budget, role} = $scope.newUser;
    userService.register(username, password, calorie_budget, role)
    .success(res=>{
      $scope.status = res;
      $timeout(()=>$scope.status='',2500);
    })
    .error((data,err)=>alert('Error connecting to server. '+data+'. '+err));
  }
};
