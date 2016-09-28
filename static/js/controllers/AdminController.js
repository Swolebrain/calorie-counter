module.exports = function($scope, entriesService){
  $scope.meals = [];
  $scope.status = "";
  entriesService.getAllEntries().success(res=>{
    if (typeof(res) === 'string') return $scope.status = 'Unauthorized';
    $scope.meals = res;
  })
  .error((err, data)=>alert("Error communicating with server: "+data+", "+error));
};
