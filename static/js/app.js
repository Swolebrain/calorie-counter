const app = angular.module('CalorieCounterApp', ['ngRoute']);
app.run(['$rootScope', '$location', '$route', 'userService',
  function ($rootScope, $location, $route, userService) {
    $rootScope.$on('$routeChangeStart',
      function (event, next, current) {
        /*
          Access restrictions:  0 - no restrictions
                                1 - all users allowed
                                2 - userAdmins and admins allowed
                                3 - only admins allowed
        */
        if (next.access.restricted===3 && !userService.isAdmin())
          bounce();
        else if (next.access.restricted === 2 && !userService.isUserAdmin() && !userService.isAdmin())
          bounce();
        else if (next.access.restricted === 1 && !userService.isLoggedIn())
          bounce();
        function bounce(){
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
    access: {restricted: 1}
  })
  .when('/settings', {
    controller: 'SettingsController',
    templateUrl: 'templates/settings.html',
    access: {restricted: 1}
  })
  .when('/reports', {
    controller: 'ReportsController',
    templateUrl: 'templates/reports.html',
    access: {restricted: 1}
  })
  .when('/user-admin', {
    controller: 'UserAdminController',
    templateUrl: 'templates/user-admin.html',
    access: {restricted: 2}
  })
  .when('/admin', {
    controller: 'AdminController',
    templateUrl: 'templates/admin.html',
    access: {restricted: 3}
  })
  .otherwise({redirectTo: '/login'});
})
.factory('userService', ['$http', '$location', '$timeout',
      require('./services/userService.js')])
.factory('entriesService', ['$http', 'userService',
      require('./services/entriesService.js')])
.directive('newMeal', ['$timeout', 'entriesService', require('./directives/newMealDirective.js')])
.directive('mealDisplay', ['$timeout', 'entriesService', require('./directives/mealDisplayDirective.js')])
.controller('LoginController', ['$scope', 'userService', '$timeout', '$location',
      require('./controllers/LoginController.js')])
.controller('ReportsController', ['$scope', 'userService', '$timeout', 'entriesService',
      require('./controllers/ReportsController.js')])
.controller('SettingsController', ['$scope', 'userService', '$timeout',
      require('./controllers/SettingsController.js')])
.controller('RegisterController', ['$scope', 'userService', '$timeout', '$location',
      require('./controllers/Registercontroller.js')])
.controller('HomeController', ['$scope', 'userService', 'entriesService',
      require('./controllers/HomeController.js')])
.controller('AdminController', ['$scope', 'entriesService',
      require('./controllers/AdminController.js')])
.controller('UserAdminController', ['$scope', 'userService', 'entriesService', '$timeout',
      require('./controllers/UserAdminController.js')]);
