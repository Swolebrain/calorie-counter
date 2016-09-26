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
  .when('/settings', {
    controller: 'SettingsController',
    templateUrl: 'templates/settings.html',
    access: {restricted: true}
  })
  .when('/reports', {
    controller: 'ReportsController',
    templateUrl: 'templates/reports.html',
    access: {restricted: true}
  })
  .otherwise({redirectTo: '/login'});
})
.factory('userService', ['$http', '$location', '$timeout',
      require('./services/userService.js')])
.factory('entriesService', ['$http', 'userService',
      require('./services/entriesService.js')])
.directive('newMealDirective', ['$timeout', 'entriesService', require('./directives/NewMealDirective.js')])
.controller('LoginController', ['$scope', 'userService', '$timeout', '$location',
      require('./controllers/LoginController.js')])
.controller('ReportsController', ['$scope', 'userService', '$timeout', 'entriesService',
      require('./controllers/ReportsController.js')])
.controller('SettingsController', ['$scope', 'userService', '$timeout',
      require('./controllers/SettingsController.js')])
.controller('RegisterController', ['$scope', 'userService', '$timeout', '$location',
      require('./controllers/Registercontroller.js')])
.controller('HomeController', ['$scope','$http', 'userService', 'entriesService',
      require('./controllers/HomeController.js')]);

},{"./controllers/HomeController.js":3,"./controllers/LoginController.js":4,"./controllers/Registercontroller.js":5,"./controllers/ReportsController.js":6,"./controllers/SettingsController.js":7,"./directives/NewMealDirective.js":8,"./services/entriesService.js":9,"./services/userService.js":10}],2:[function(require,module,exports){
module.exports = function($scope, $timeout){
  return {displayStatus, inputsAreFilled};

  function displayStatus(status){
    $scope.status=status;
    $timeout(()=>$scope.status='',2500);
  }
  function inputsAreFilled(inputNames){
    for(let i = 0; i< inputNames.length; i++){
      if (!$scope[inputNames[i]]){
        displayStatus('Please fill out all fields');
        return false;
      }
      if (typeof($scope[inputNames[i]]) == 'string'){
        $scope[inputNames[i]] = $scope[inputNames[i]].trim();
        if (!$scope[inputNames[i]]){
          displayStatus('Please fill out all fields');
          return false;
        }
      }    
    }
    return true;
    // if (!$scope.username || !$scope.password){
    //   displayStatus('Please fill out all fields');
    //   return false;
    // }
    // $scope.username = $scope.username.trim();
    // $scope.password = $scope.password.trim();
    // //check again after removing whitespace
    // if (!$scope.username || !$scope.password){
    //   return displayStatus('Please fill out all fields');
    //   return false;
    // }
    // return true;
  }
};

},{}],3:[function(require,module,exports){
module.exports = function($scope, $http, userService, entriesService){
  $scope.meals = [];
  $scope.totalCals = 0;
  $scope.totalCalsClass = '';
  $scope.date = getDate(0);
  $scope.dayOffset = 0;
  $scope.user = userService.getUserObject();
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
  $scope.logOut = logOut;
  updateMeals();

  function deleteMeal(id){
    entriesService.deleteEntry(id).success(res=>{
      updateMeals();
    })
    .error((data, err) => alert("Error communicating with server: "+data));
  }
  //function to update the $scope.meals array
  function updateMeals(){
    $scope.date = getDate($scope.dayOffset);
    entriesService.getEntriesByDate(getDate($scope.dayOffset)).success(res=>{
      $scope.meals = res;
      computeTotalCals();
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
  function logOut(){
    userService.logOut();
  }
};
/*
Function that returns a properly formatted date string based on a day offset
eg with day offset -1, returns yesterday's date, with day offset +2, returns
the day after tomorrow
*/
function getDate(dayOffset){
  let date = new Date(new Date().getTime() + dayOffset*1000*60*60*24);
  let day = ("0"+date.getDate()).slice(-2);
  let month = ("0"+(date.getMonth()+1)).slice(-2);
  let year = date.getFullYear();
  return year+'-'+month+'-'+day;
}

},{}],4:[function(require,module,exports){
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

},{"../common/common.js":2}],5:[function(require,module,exports){
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

},{"../common/common.js":2}],6:[function(require,module,exports){
module.exports = function($scope, userService, $timeout, entriesService){
  const displayStatus = require('../common/common.js')($scope, $timeout).displayStatus;
  $scope.logOut = ()=>userService.logOut();
  $scope.summaryEntries = [];
  $scope.showReport = function(){
    let {formStartDate:startDate, formEndDate: endDate,
      formStartTime: startTime, formEndTime: endTime} = $scope;
    if (!endTime) endTime = '23:59:pm';
    if (!startTime) startTime = '00:00:am';
    if (!startDate || !endDate){
      return displayStatus('Please select at least start and end dates')
    }
    startDate = formatDate(startDate);
    endDate = formatDate(endDate);
    startTime = formatTime(startTime);
    endTime = formatTime(endTime);
    entriesService.getEntriesByDateRange(startDate, endDate).then(res=>{
      $scope.summaryEntries = [];
      //here we filter by start time and end time
      let ctr = 0;
      for (var day = new Date(startDate); day <= new Date(endDate); day.setDate(day.getDate()+1)){
        let daysEntries = Array.prototype.filter.call(res.data, entry=>new Date(entry.date).getDate()==day.getDate());
        console.log(daysEntries);
        if (daysEntries.length > 0){
          let summaryCals = daysEntries.reduce((p,c)=>p+getCalories(c,startTime,endTime), 0);
          $scope.summaryEntries.push({date: daysEntries[0].date, calories: summaryCals});
        }

        if (ctr++ > 100) break; //infinite loop protection
      }
    });
  };
};

function formatDate(timeStr){
  if (!timeStr) return;
  let time = new Date(timeStr);
  let year = time.getFullYear();
  let day = ("0"+time.getDate()).slice(-2);
  let month = ("0"+(time.getMonth()+1)).slice(-2);
  return year+'-'+month+'-'+day;
}

function formatTime(timeStr){
  if (!timeStr) return;
  if (timeStr.match && timeStr.match(/\d\d:\d\d:[ap]m/)) return timeStr;
  let time = new Date(timeStr);
  let hour = time.getHours();
  let ampm = 'am';
  if (hour >= 12){
    ampm = 'pm';
    if (hour > 12 ) hour = hour % 12;
  }
  let minutes = ("0"+time.getMinutes()).slice(-2);
  return hour+":"+minutes+":"+ampm;
}
/*
  Aux function to access the calories from an entry.
  Returns 0 if entry is not within startTime and endTime
*/
function getCalories(entry, startTime, endTime){
  //console.log(`Seeing if ${entry.time} is within ${startTime} and ${endTime}`);
  let entryTime = convertToMilitaryTime(entry.time.split(":"));
  startTime = convertToMilitaryTime(startTime.split(":"));
  endTime = convertToMilitaryTime(endTime.split(":"));
  //console.log(`Seeing if ${entryTime} is within ${startTime} and ${endTime}`);
  if (entryTime >= startTime && entryTime <= endTime){
    //console.log('returning '+entry.calories);
    return entry.calories;
  }
  else {
    //console.log('returning 0');
    return 0;
  }
}

function convertToMilitaryTime(timeArr){
  let ret;
  if (timeArr[2] == 'pm' && Number(timeArr[0]) < 12)
    ret = (12+ Number(timeArr[0]))+":"+ ("0"+timeArr[1]).slice(-2);
  else ret = ("0"+timeArr[0]).slice(-2) + ":" + ("0"+timeArr[1]).slice(-2);
  return ret;
}

},{"../common/common.js":2}],7:[function(require,module,exports){
module.exports = function($scope, userService, $timeout){
  console.log('ReportsController reporting in');
  const displayStatus = require('../common/common.js')($scope, $timeout).displayStatus;
  $scope.user = userService.getUserObject();
  $scope.logOut = ()=>userService.logOut();
  $scope.newUserData = {id: $scope.user.id,
                      username: $scope.user.username,
                      calorie_budget: $scope.user.calorie_budget};
  $scope.updateUser = function(){
    if ($scope.newUserData.password){
      if ($scope.newUserData.password != $scope.newUserData.passwordConf)
        return displayStatus('Passwords do not match');
    }
    else{
      delete $scope.newUserData.password;
    }
    userService.updateUser($scope.newUserData).success(res=>{
      //
      console.log(res);
      displayStatus('User updated!');
    }).error((data,status)=>alert('Error: '+JSON.stringify(data)));
  }
};

},{"../common/common.js":2}],8:[function(require,module,exports){
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
        let validationError = findInputErrors(scope.newEntry.calories, scope.newEntry.text, scope.newEntry.time);
        if (validationError){
          scope.status = validationError;
          $timeout(()=>scope.status='',2500);
          return;
        }
        entriesService.addEntry(scope.newEntry).success(res=>{
          if (res.insertId){
            scope.status = 'Insertion succeeded!';
            scope.updateMeals();
            scope.newEntry.calories = '';
            scope.newEntry.text = '';
            scope.newEntry.time = '';
            $timeout(()=>{
              scope.status='';
            },2500);
          }
        })
        .error((data, status)=>{
          alert('Something went wrong when connecting to the server');
        });
      }
    }
  };
};

function isValidTime(timeStr){
  if(!timeStr || timeStr.length < 2) return false;
  timeStr = (""+timeStr).trim();
  let time = timeStr.split(':');
  if (time.length != 3) return false;
  let hours = parseInt(time[0],10);
  let minutes = parseInt(time[1],10);
  let ampm = time[2].toLowerCase();
  return hours <= 12 && hours >= 0 && minutes >= 0 && minutes < 60 && (ampm =='am' || ampm == 'pm');
}

function isValidCalories(cals){
  if (!cals) return false;
  return Number(cals) == cals;
}
//!isValidCalories(scope.newEntry.calories) || !scope.newEntry.text ||
function findInputErrors(cals,text,time){
  if (!isValidTime(time)) return "Invalid Time entry";
  if (!text) return "Invalid description";
  if (!isValidCalories(cals)) return "Invalid calorie entry"
  return false;
}

},{}],9:[function(require,module,exports){

module.exports = function($http, userService){
  function getEntriesByDate(date){
    if (!dateIsValid(date)) return 'Wrong date string';
    else return $http.get('entries/'+date);
  }
  function getEntriesByDateRange(start, end){
    if (!dateIsValid(start) || !dateIsValid(end)) return console.log('Wrong date range!');
    else return $http.get('entries/'+start+'/'+end).success(res=>{
      return res.forEach(entry=>{
        //replace the annoying time string that comes from the server
        entry.date = entry.date.split("T")[0];
      });
    });
  }
  function deleteEntry(id){
    return $http.delete('entries/'+id);
  }
  //receives {date, time, text, calories}
  function addEntry(newEntry){
    newEntry.uid = userService.getUserObject().id;
    return $http.post('entries/', newEntry);
  }
  return {getEntriesByDate, deleteEntry, addEntry, getEntriesByDateRange};
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

},{}],10:[function(require,module,exports){
module.exports = function($http, $location){
  const loginUri = 'users/authenticate';
  const registerUri = 'users/';
  //When authenticated, this object contains {id, username, calorie_budget}
  let userObject = null; //localStorage.getItem("userObject");
  if (userObject) userObject = JSON.parse(userObject);
  else userObject = null;
  function authenticate(username, password){
    return $http.post(loginUri, {username, password}).success(res=>{
      if (res.id && res.calorie_budget && res.username) {
        userObject = res;
        //localStorage.setItem("userObject", JSON.stringify(res));
      }
      return res;
    }).error((data,status)=>alert('Error authenticating user:'+status))
  }
  function register(username, password, calorie_budget){
    return $http.post(registerUri, {username, password, calorie_budget})
    .error((data, status) => alert('Error connecting to server:'+status));
  }
  //Server route requires {username, calorie_budget, role, password}
  //this service sends {username, calorie_budget, password}
  function updateUser(userObj){
    return $http.put('users/'+userObj.id, userObj).success(res=>{
      if (res.affectedRows === 1) {
        userObject.calorie_budget = userObj.calorie_budget;
        //localStorage.setItem("userObject", JSON.stringify(userObject));
      }
      return res;
    });
  }
  function isLoggedIn(){
    return userObject != null;
  }
  function getUserObject(){
    return userObject;
  }
  function logOut(){
    //localStorage.removeItem("userObject");
    userObject = null;
    console.log('logging out...');
    $location.path('/login');
  }
  return {authenticate, register, isLoggedIn, getUserObject, logOut, updateUser};
};

},{}]},{},[1]);
