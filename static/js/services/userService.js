module.exports = function($http, $location){
  const loginUri = 'users/authenticate';
  const registerUri = 'users/';
  //When authenticated, this object contains {id, username, calorie_budget}
  let userObject = null; //localStorage.getItem("userObject");
  //if (userObject) userObject = JSON.parse(userObject);
  //else userObject = null;
  function authenticate(username, password){
    return $http.post(loginUri, {username, password}).success(res=>{
      if (res.id && res.calorie_budget && res.username) {
        userObject = res;
        //localStorage.setItem("userObject", JSON.stringify(res));
      }
      return res;
    }).error((data,status)=>alert('Error authenticating user:'+status))
  }
  function register(username, password, calorie_budget, role){
    let data = {username, password, calorie_budget};
    if (role) data.role = role;
    return $http.post(registerUri, data)
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
  //server routes for admin and user-admin to see all users
  function getAllUsers(){
    if (isAdmin() || isUserAdmin()){
      return $http.get('users/');
    }
    alert('Unauthorized: cannot see all users');
    return [];
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
  function isAdmin(){
    return userObject && userObject.role=='admin';
  }
  function isUserAdmin(){
    return userObject && userObject.role=='user-admin';
  }
  return {authenticate, register, isLoggedIn,
    getUserObject, logOut, updateUser, isAdmin, isUserAdmin, getAllUsers};
};
