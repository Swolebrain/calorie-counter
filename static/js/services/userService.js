module.exports = function($http){
  const loginUri = 'users/authenticate';
  const registerUri = 'users/';
  //When authenticated, this object contains {id, username, calorie_budget}
  let userObject = null;
  function authenticate(username, password){
    return $http.post(loginUri, {username, password}).success(res=>{
      console.log(res);
      if (res.id && res.calorie_budget && res.username) userObject = res;
      return res;
    }).error((data,status)=>alert('Error authenticating user:'+status))
  }
  function register(username, password, calorie_budget){
    return $http.post(registerUri, {username, password, calorie_budget})
    .success(res=>{
      if (res.affectedRows === 1){ //user was created
        let id = res.insertId;
        userObject = {id, username, calorie_budget };
        return res;
      }
      else{//user was not created
        console.log('this is running');
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
  return {authenticate, register, isLoggedIn, getUserObject};
};
