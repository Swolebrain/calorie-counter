(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const app = angular.module('CalorieCounterApp', ['ngRoute']);
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
.factory('entriesService', ['$http', 'userService',
      require('./services/entriesService.js')])
.directive('newMealDirective', ['$timeout', 'entriesService', require('./directives/NewMealDirective.js')])
.controller('LoginController', ['$scope', 'userService', '$timeout', '$location',
      require('./controllers/LoginController.js')])
.controller('RegisterController', ['$scope', 'userService', '$timeout', '$location',
      require('./controllers/Registercontroller.js')])
.controller('HomeController', ['$scope','$http', 'userService', 'entriesService',
      require('./controllers/HomeController.js')]);

},{"./controllers/HomeController.js":2,"./controllers/LoginController.js":3,"./controllers/Registercontroller.js":4,"./directives/NewMealDirective.js":5,"./services/entriesService.js":6,"./services/userService.js":7}],2:[function(require,module,exports){
module.exports = function($scope, $http, userService, entriesService){
  console.log('Home controller reporting in');
  $scope.meals = [];
  $scope.totalCals = 0;
  $scope.totalCalsClass = '';
  $scope.date = getDate(0);
  $scope.dayOffset = 0;
  $scope.uid = userService
  $scope.incDate = function(){
    $scope.dayOffset += 1;
    updateMeals();
  };
  $scope.decDate = function(){
    $scope.dayOffset -= 1;
    updateMeals();
  };
  $scope.updateMeals = updateMeals;
  $scope.deleteMeal = deleteMeal;
  updateMeals();

  function deleteMeal(id){
    entriesService.deleteEntry(id).success(res=>{
      updateMeals();
      console.log(res);
    })
    .error((data, err) => alert("Error communicating with server: "+data));
  }
  //function to update the $scope.meals array
  function updateMeals(){
    console.log('Running HomeController.updateMeals');
    $scope.date = getDate($scope.dayOffset);
    entriesService.getEntriesByDate(getDate($scope.dayOffset)).success(res=>{
      $scope.meals = res;
      computeTotalCals();
      console.log(res);
    })
    .error((data, err)=>alert("Error communicating with server: "+data));
  }
  function computeTotalCals(){
    $scope.totalCals = Array.prototype.reduce.call($scope.meals, (p,c)=>p+Number(c.calories) , 0);
    if ($scope.totalCals > userService.getUserObject().calorie_budget)
      $scope.totalCalsClass = 'text-danger';
    else
      $scope.totalCalsClass = 'text-success';
  }
};
/*
Function that returns a properly formatted date string based on a day offset
eg with day offset -1, returns yesterday's date, with day offset +2, returns
the day after tomorrow
*/
function getDate(dayOffset){
  let date = new Date(new Date().getTime() + dayOffset*1000*60*60*24);
  let day = date.getDate();
  let month = date.getMonth()+1;
  let year = date.getFullYear();
  return year+'-'+month+'-'+day;
}

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
module.exports = function($timeout, entriesService){
  return {
    restrict: 'E',
    scope:{
      date: '=',
      updateMeals : '&'
    },
    templateUrl: 'js/directives/newMealDirective.html',
    link: function(scope, elem, attrs){
      scope.newEntry = {};
      scope.status = '';
      scope.createMeal = function(){
        scope.newEntry.date = scope.date;
        if (!isValidCalories(scope.newEntry.calories) || !scope.newEntry.text || !isValidTime(scope.newEntry.time)){
          scope.status = 'Some fields are incorrect';
          $timeout(()=>scope.status='',2500);
          return;
        }
        entriesService.addEntry(scope.newEntry).success(res=>{
          if (res.insertId){
            scope.status = 'Insertion succeeded!';
            scope.updateMeals();
            $timeout(()=>{
              scope.status='';
              scope.newEntry.calories = '';
              scope.newEntry.text = '';
              scope.newEntry.time = '';
            },2500);
          }
          console.log(res);
        })
        .error((data, status)=>{
          alert('Something went wrong when connecting to the server');
        });
      }
    }
  };
};

function isValidTime(timeStr){
  timeStr = timeStr.trim();
  if (timeStr.length == 0) return false;
  let time = timeStr.split(':');
  if (time.length != 3) return false;
  let hours = parseInt(time[0],10);
  let minutes = parseInt(time[1],10);
  let ampm = time[2].toLowerCase();
  return hours < 12 && hours >= 0 && minutes >= 0 && minutes < 60 && (ampm =='am' || ampm == 'pm');
}

function isValidCalories(cals){
  return Number(cals) == cals;
}

},{}],6:[function(require,module,exports){

module.exports = function($http, userService){
  function getEntriesByDate(date){
    if (!dateIsValid(date)) return 'Wrong date string';
    else return $http.get('entries/'+date);
  }
  function deleteEntry(id){
    return $http.delete('entries/'+id);
  }
  //receives {date, time, text, calories}
  function addEntry(newEntry){
    newEntry.uid = userService.getUserObject().id;
    return $http.post('entries/', newEntry);
  }
  return {getEntriesByDate, deleteEntry, addEntry};
};

//validates that dateStr is formatted as yyyy-mm-dd or yyy-m-d
function dateIsValid(dateStr){
  if (!dateStr.match(/\d\d\d\d-[0-9]{1,2}-[0-9]{1,2}/)) return false;
  let parts = dateStr.split('-');
  let day = parseInt(parts[2], 10);
  let month = parseInt(parts[1], 10);
  let year = parseInt(parts[0], 10);
  if(year < 1000 || year > 3000 || month == 0 || month > 12)
        return false;
  let monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
  // Adjust for leap years
  if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
      monthLength[1] = 29;
  // Check the range of the day
  return day > 0 && day <= monthLength[month - 1];
}

},{}],7:[function(require,module,exports){
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
  function getUserObject(){
    return userObject;
  }
  return {authenticate, register, isLoggedIn, getUserObject};
};

},{}]},{},[1]);
