module.exports = function($timeout, entriesService){
  return {
    restrict: 'E',
    scope: {
      meal: '=',
      updateMeals: '&'
    },
    templateUrl: 'js/directives/mealDisplayDirective.html',
    link: function(scope, elem, attrs){
      scope.deleteMeal = function(){
        entriesService.deleteEntry(scope.meal.id).success(res=>{
          scope.updateMeals();
        })
        .error((data, err) => alert("Error communicating with server: "+data));
      };
    }
  };
};
