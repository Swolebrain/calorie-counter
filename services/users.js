const {connection, issueQuery, sanitizeReqBody} = require('./db.js');
const bcrypt = require('bcryptjs');

module.exports = function(app){
  //accessible by admin only
  app.get('/users', function(req,res){
    let query = `SELECT * FROM users`;
    issueQuery(query, res, 'fetching all entries');
  });
  //accessible by admin or if req.params.id matches session id
  app.get('/users/:id', function(req,res){
    let query = `SELECT * FROM users WHERE id=${connection.escape(req.params.id)}`;
    issueQuery(query, res, 'fetching all entries');
  });
  //accessible by admin or if req.params.id matches session id
  //doesn't require sending password
  app.put('/users/:id', function(req,res){
    console.log('request to update user with id'+req.params.id+'. Request body:');
    console.log(JSON.stringify(req.body));
    let {username, calorie_budget, role, password} = sanitizeReqBody(req);
    if (!username || !calorie_budget || !role ) {
      res.end(`Error: some fields were incorrect: ${JSON.stringify(req.body)}`);
      return;
    }
    let query, password_hash;
    if (password){
      password_hash = "'"+bcrypt.hashSync(password, 6)+"'";
      query = `UPDATE users SET username=${username}, calorie_budget=${calorie_budget},
                  role=${role}, password_hash=${password_hash} WHERE id=${connection.escape(req.params.id)}`;
    }
    else{
      query = `UPDATE users SET username=${username}, calorie_budget=${calorie_budget},
                  role=${role} WHERE id=${connection.escape(req.params.id)}`;
    }
    issueQuery(query, res, 'updating user data for '+req.params.id)
  });
  //accessible by everyone. TODO: Only admins can create admins
  //requires sending password (duh)
  app.post('/users', function(req,res){
    console.log('request to add user. Request body:');
    console.log(JSON.stringify(req.body));
    let {username, calorie_budget, role, password} = sanitizeReqBody(req);
    console.log(role);
    console.log(!req.session);
    if (role==`'admin'` && !(req.session && req.session.isAdmin)){
      console.log('Tried to add admin user without a valid admin session');
      res.end('Error: only admin users can create admin users');
      return;
    }
    let password_hash = "'"+bcrypt.hashSync(password, 6)+"'";
    let query = `INSERT INTO users (username, password_hash, calorie_budget, role) VALUES
                  (${username}, ${password_hash}, ${calorie_budget}, ${role})`;
    issueQuery(query, res, 'creating new user with username '+username);
  });
  //accessible by admin or if req.params.id matches session id
  app.delete('/users/:id', function(req,res){
    console.log('request to delete user with id'+req.params.id);
    let query = `DELETE FROM users WHERE id=${connection.escape(req.params.id)}`;
    issueQuery(query, res, 'deleting user with id: '+req.params.id);
  });
};
