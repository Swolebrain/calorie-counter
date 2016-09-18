const app = angular.module('AuthApp', ['ngRoute']);
app.config(function($routeProvider){
  $routeProvider
  .when('/login', {
    controller: 'LoginController',
    templateUrl: 'templates/login.html'
  })
  .when('/register', {
    controller: 'RegisterController',
    templateUrl: 'templates/register.html'
  })
  .otherwise({redirectTo: '/login'});
})
.factory('userService', ['$http', function($http){
  const loginUri = 'users/authenticate';
  const registerUri = 'users/';
  const authRedirect = '/';
  function authenticate(username, password){
    console.log(username);
    return $http.post(loginUri, {username, password});//.success(res=>res).error((data,status)=>alert('Error authenticating user:'+status))
  }
  function register(username, password, calorie_budget){
    return $http.post(registerUri, {username, password, calorie_budget});
  }
  return {authenticate, register, authRedirect};
}])
.controller('LoginController', ['$scope', 'userService', '$timeout', function($scope, userService, $timeout){
  console.log('login controller reporting in');
  $scope.status = '';
  $scope.auth = function(){
    $scope.status = 'Logging in...';
    userService.authenticate($scope.username, $scope.password).success(res=>{
      $scope.status = res;
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
}])
.controller('RegisterController', ['$scope', 'userService', '$timeout', function($scope, userService, $timeout){
  console.log('register controller reporting in');
  $scope.status = '';
  $scope.register = function(){
    if ($scope.password != $scope.passwordConf){
      $scope.status = "Passwords don't match!";
      return;
    }
    $scope.status = 'Registering...';
    userService.register($scope.username, $scope.password, $scope.calorie_budget).success(res=>{
      $scope.status = res;
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
}]);
