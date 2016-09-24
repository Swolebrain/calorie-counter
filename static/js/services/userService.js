module.exports = function($http){
  const loginUri = 'users/authenticate';
  const registerUri = 'users/';
  const isAuthenticated = false;
  let userObject = null;
  function authenticate(username, password){
    return $http.post(loginUri, {username, password}).success(res=>{
      if (res.id && res.calorie_budget && res.username) userObject = res;
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
