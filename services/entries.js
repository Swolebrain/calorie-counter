const {getConnection, issueQuery, sanitizeReqBody, esc} = require('./db.js');

module.exports = function(app){
  //main route for app, get entries by date
  //date should be formatted as yyy-mm-dd, not yyyy-m-d
  app.get('/entries/:date', function (req,res){
    console.log('Received query for entries');
    let query = `SELECT * FROM entries WHERE date='${req.params.date}'`;
    if (!req.session.isAdmin) query += ` AND uid=${esc(req.session.uid)}`;
    issueQuery(query, res, 'fetching entries by date');
  });
  //main route for reports, get entries by date range
  app.get('/entries/:start/:end', function (req,res){
    let query = `SELECT * FROM entries WHERE date>=${esc(req.params.start)}
              AND date <=${getConnection().escape(req.params.end)}`;
    if (!req.session.isAdmin) query += ` AND uid=${esc(req.session.uid)}`;
    issueQuery(query, res, 'fetching entries by date range');
  });
  //only admin access
  app.get('/entries', function(req,res){
    console.log('Received request for all entries');
    if (!req.session.isAdmin) return res.end('Error: You must be an admin for that');
    let query = `SELECT * FROM entries`;
    issueQuery(query, res, 'fetching all entries');
  });
  //accessible by admin or any authenticated users
  app.get('/entries/:id', function(req,res){
    let query = `SELECT * FROM entries WHERE id=${esc(req.params.id)}`;
    if (!req.session.isAdmin) query += ` AND uid=${esc(req.session.uid)}`;
    issueQuery(query, res, 'fetching entry by id: '+req.params.id);
  });
  //accessible by admin or if req.params.id matches session id
  //requires ALL in fields to be re-sent in body
  //date, time, text, calories, uid
  //design decision: uid can never be changed
  app.put('/entries/:id', function(req,res){
    console.log('request body:');
    console.log(JSON.stringify(req.body));
    let {date, time, text, calories, uid} = sanitizeReqBody(req);
    if (!date || !time || !text || !calories || !uid) {
      res.end(`Error: some fields were incorrect: ${JSON.stringify(req.body)}`);
      return;
    }
    let query = `UPDATE entries SET date=${date}, time=${time}, text=${text}, calories=${calories}
                WHERE id=${esc(req.params.id)}`;
    if (!req.session.isAdmin) query += ` AND uid=${esc(req.session.uid)}`;
    issueQuery(query, res, `modifying entry ${req.params.id} for ${uid}`);
  });
  //accessible by admin or if req.params.id matches session id
  //requires ALL in fields to be re-sent in body
  app.post('/entries', authPost, function(req,res){
    console.log('request body:');
    console.log(JSON.stringify(req.body));
    let {date, time, text, calories, uid} = sanitizeReqBody(req);
    if (!date || !time || !text || !calories || !uid) {
      return res.end(`Error: some fields were incorrect: ${JSON.stringify(req.body)}`);
    }
    let query = `INSERT INTO entries (date, time, text, calories, uid)
                  VALUES (${date}, ${time}, ${text}, ${calories}, ${uid})`;
    issueQuery(query, res, 'posting an entry for '+uid);
  });
  //accessible by admin or if req.params.id matches session id
  app.delete('/entries/:id', function(req,res){
    let query = `DELETE FROM entries WHERE id=${esc(req.params.id)}`;
    if (!req.session.isAdmin) query += ` AND uid=${esc(req.session.uid)}`;
    issueQuery(query, res, 'deleting entry with id '+req.params.id);
  });
};

//middleware to protect post route
function authPost(req, res, next){
  if (!req.session || !req.session.isAuthenticated)
    res.end('Error: You need to be logged in for that');
  else if (req.body.uid == req.session.uid || req.session.isAdmin)
    return next();
  return res.end('Error: You need to be logged in for that');
}
