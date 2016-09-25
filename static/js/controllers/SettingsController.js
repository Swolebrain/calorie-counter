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
