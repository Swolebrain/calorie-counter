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
