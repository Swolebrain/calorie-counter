module.exports = function($http, $location){
  const loginUri = 'users/authenticate';
  const registerUri = 'users/';
  //When authenticated, this object contains {id, username, calorie_budget}
  let userObject = localStorage.getItem("userObject");
  if (userObject) userObject = JSON.parse(userObject);
  else userObject = null;
  function authenticate(username, password){
    return $http.post(loginUri, {username, password}).success(res=>{
      if (res.id && res.calorie_budget && res.username) {
        userObject = res;
        localStorage.setItem("userObject", JSON.stringify(res));
      }
      return res;
    }).error((data,status)=>alert('Error authenticating user:'+status))
  }
  function register(username, password, calorie_budget){
    return $http.post(registerUri, {username, password, calorie_budget})
    .success(res=>{
      if (res.affectedRows === 1){ //user was created
        let id = res.insertId;
        userObject = {id, username, calorie_budget };
        localStorage.setItem("userObject", JSON.stringify(userObject));
        return res;
      }
      else{//user was not created
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
  function logOut(){
    localStorage.removeItem("userObject");
    userObject = null;
    console.log('logging out...');
    $location.path('/login');
  }
  return {authenticate, register, isLoggedIn, getUserObject, logOut};
};
