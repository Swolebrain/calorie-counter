const {connection, issueQuery, sanitizeReqBody} = require('./db.js');

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
  app.put('/users/:id', function(req,res){
    console.log('request to update user with id'+req.params.id+'. Request body:');
    console.log(JSON.stringify(req.body));
    let {username, calorie_budget, role} = sanitizeReqBody(req);
    if (!username || !calorie_budget || !role ) {
      res.end(`Error: some fields were incorrect: ${JSON.stringify(req.body)}`);
      return;
    }
    let query = `UPDATE users SET username=${username}, calorie_budget=${calorie_budget},
                role=${role} WHERE id=${connection.escape(req.params.id)}`;
    issueQuery(query, res, 'updating user data for '+req.params.id)
  });
  app.post('/users', function(req,res){

  });
  app.delete('/users/:id', function(req,res){

  });
};
