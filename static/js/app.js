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
