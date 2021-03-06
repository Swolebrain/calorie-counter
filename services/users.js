const {getConnection, issueQuery, sanitizeReqBody, esc} = require('./db.js');
const bcrypt = require('bcryptjs');

module.exports = function(app){
  app.post('/users/authenticate', function(req, res){
    console.log('request to authenticate user with username '+req.body.username+'. Request body:');
    console.log(JSON.stringify(req.body));
    let {username, password} = sanitizeReqBody(req);
    let query = `SELECT * FROM users WHERE username=${username}`;
    issueQuery(query, res, "looking up user by name (db error)", authCallback);
    function authCallback(err, rows){
      if (!rows || rows.length != 1){
        return res.end('Error: username not found');
      }
      let passwordMatches = bcrypt.compareSync(password, rows[0].password_hash);
      if (passwordMatches){
        let {id, username, calorie_budget, role} = rows[0];
        req.session.uid = id;
        req.session.isAuthenticated = true;
        if (rows[0].role == 'admin') req.session.isAdmin = true;
        else if (rows[0].role == 'user-admin') req.session.isUserAdmin = true;
        res.json({ id, username, calorie_budget, role});
      }
      else{
        res.end('Error: password is wrong');
      }
    }
  });
  //accessible by admin only
  app.get('/users', function(req,res){
    if (!req.session.isAdmin) return res.send(401);
    let query = `SELECT * FROM users`;
    issueQuery(query, res, 'fetching all entries');
  });
  //accessible by admin or if req.params.id matches session id
  app.get('/users/:id', authAdminOrOwner, function(req,res){
    let query = `SELECT * FROM users WHERE id=${esc(req.params.id)}`;
    issueQuery(query, res, 'fetching all entries');
  });
  //accessible by admin or if req.params.id matches session id
  //doesn't require sending password
  app.put('/users/:id', authAdminOrOwner, function(req,res){
    console.log('request to update user with id'+req.params.id+'. Request body:');
    console.log(JSON.stringify(req.body));
    let {username, calorie_budget, role, password} = sanitizeReqBody(req);
    if (!username || !calorie_budget ) {
      res.end(`Error: some fields were incorrect: ${JSON.stringify(req.body)}`);
      return;
    }
    //if role field is absent, default to keeping role the same role or regular user role
    if (!role){
      if (req.session.isAdmin && req.params.id === req.session.uid) role = `'admin'`;
      else if (req.session.isUserAdmin && req.params.id === req.session.uid) role = `'user-admin'`;
      else role = `'user'`
    }
    let query, password_hash;
    if (password){
      console.log("User PUT request with password change, new password is "+password);
      password_hash = "'"+bcrypt.hashSync(password, 6)+"'";
      query = `UPDATE users SET username=${username}, calorie_budget=${calorie_budget},
                  role=${role}, password_hash=${password_hash} WHERE id=${esc(req.params.id)}`;
    }
    else{
      query = `UPDATE users SET username=${username}, calorie_budget=${calorie_budget},
                  role=${role} WHERE id=${esc(req.params.id)}`;
    }
    issueQuery(query, res, 'updating user data for '+req.params.id)
  });
  //accessible by everyone.
  //requires sending password (duh)
  //response.insertId contains the database id of newly created user
  app.post('/users', function(req,res){
    console.log('request to add user. Request body:');
    console.log(JSON.stringify(req.body));
    let {username, calorie_budget, role, password} = sanitizeReqBody(req);
    if (!role) role = `'user'`;
    if (role==`'admin'` && !(req.session && req.session.isAdmin)){
      console.log('Tried to add admin user without a valid admin session');
      res.end('Error: only admin users can create admin users');
      return;
    }
    let password_hash = "'"+bcrypt.hashSync(password, 6)+"'";
    let query = `INSERT INTO users (username, password_hash, calorie_budget, role) VALUES
                  (${username}, ${password_hash}, ${calorie_budget}, ${role})`;
    issueQuery(query, res, 'inserting new user with username '+username, createCallback);
    function createCallback(err, result){
      if (!result || result.affectedRows != 1){
        console.log(result);
        res.end('Error: affectedRows was '+result.affectedRows);
      }
      console.log("Callback from registration route: error, rows ");
      console.log(result);
      res.json(result);

    }
  });
  //accessible by admin or if req.params.id matches session id
  app.delete('/users/:id', authAdminOrOwner, function(req,res){
    console.log('request to delete user with id'+req.params.id);
    let query = `DELETE FROM users WHERE id=${esc(req.params.id)}`;
    issueQuery(query, res, 'deleting user with id: '+req.params.id);
  });
};

function authAdminOrOwner(req, res, next){
  if (req.session && req.session.isAuthenticated){
    if (req.session.isAdmin || req.session.isUserAdmin) return next();
    if (req.session.uid == req.params.id) return next();
  }
  res.send(401)
}
