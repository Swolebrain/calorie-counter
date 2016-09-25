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
    $scope.username = $scope.username.trim();
    $scope.password = $scope.password.trim();
    if (!$scope.username || !$scope.password){
      $scope.status = 'Please fill out all fields';
      return;
    }
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

},{}],5:[function(require,module,exports){
module.exports = function($http){
  const loginUri = 'users/authenticate';
  const registerUri = 'users/';
  //When authenticated, this object contains {id, username, calorie_budget}
  let userObject = null;
  function authenticate(username, password){
    return $http.post(loginUri, {username, password}).success(res=>{
      console.log(res);
      if (res.id && res.calorie_budget && res.username) userObject = res;
      return res;
    }).error((data,status)=>alert('Error authenticating user:'+status))
  }
  function register(username, password, calorie_budget){
    return $http.post(registerUri, {username, password, calorie_budget})
    .success(res=>{
      if (res.affectedRows === 1){ //user was created
        let id = res.insertId;
        userObject = {id, username, calorie_budget };
        return res;
      }
      else{//user was not created
        console.log('this is running');
        return res.data;
      }
    })
    .error((data, status) => alert('Error connecting to server:'+status));
  }
  function isLoggedIn(){
    return userObject != null;
  }
  return {authenticate, register, isLoggedIn};
};

},{}]},{},[1]);
