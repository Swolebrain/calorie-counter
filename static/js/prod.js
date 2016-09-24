(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const app = angular.module('AuthApp', ['ngRoute']);
app.run(['$rootScope', '$location', '$route', 'userService',
  function ($rootScope, $location, $route, userService) {
    $rootScope.$on('$routeChangeStart',
      function (event, next, current) {
        if (next.access.restricted && !userService.isLoggedIn()) {
          $location.path('/login');
          $route.reload();
        }
      });
}])
.config(function($routeProvider){
  $routeProvider
  .when('/login', {
    controller: 'LoginController',
    templateUrl: 'templates/login.html',
      access: {restricted: false}
  })
  .when('/register', {
    controller: 'RegisterController',
    templateUrl: 'templates/register.html',
      access: {restricted: false}
  })
  .when('/', {
    controller: 'HomeController',
    templateUrl: 'templates/home.html',
      access: {restricted: true}
  })
  .otherwise({redirectTo: '/login'});
})
.factory('userService', ['$http',
      require('./services/userService.js')])
.controller('LoginController', ['$scope', 'userService', '$timeout', '$location',
      require('./controllers/LoginController.js')])
.controller('RegisterController', ['$scope', 'userService', '$timeout', '$location',
      require('./controllers/Registercontroller.js')])
.controller('HomeController', ['$http', 'userService',
      require('./controllers/HomeController.js')]);

},{"./controllers/HomeController.js":2,"./controllers/LoginController.js":3,"./controllers/Registercontroller.js":4,"./services/userService.js":5}],2:[function(require,module,exports){
module.exports = function($http, userService){
  console.log('Home controller reporting in');
};

},{}],3:[function(require,module,exports){
module.exports = function($scope, userService, $timeout, $location){
  console.log('login controller reporting in');
  $scope.status = '';
  $scope.auth = function(){
    $scope.status = 'Logging in...';
    userService.authenticate($scope.username, $scope.password).then(res=>{
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

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
module.exports = function($http){
  const loginUri = 'users/authenticate';
  const registerUri = 'users/';
  const isAuthenticated = false;
  let userObject = null;
  function authenticate(username, password){
    return $http.post(loginUri, {username, password}).success(res=>{
      if (res.id) userObject = res;
      console.log(res);
      return res;
    }).error((data,status)=>alert('Error authenticating user:'+status))
  }
  function register(username, password, calorie_budget){
    return $http.post(registerUri, {username, password, calorie_budget});
  }
  function isLoggedIn(){
    return userObject != null;
  }
  return {authenticate, register, isLoggedIn};
};

},{}]},{},[1]);
