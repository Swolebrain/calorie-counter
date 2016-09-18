const {connection, issueQuery, sanitizeReqBody} = require('./db.js');

module.exports = function(app){
  //only admin access
  app.get('/entries', function(req,res){
    let query = `SELECT * FROM entries`;
    issueQuery(query, res, 'fetching all entries');
  });
  //accessible by admin or if req.params.id matches session id
  app.get('/entries/:id', function(req,res){
    let query = `SELECT * FROM entries WHERE id=${connection.escape(req.params.id)}`;
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
                WHERE id=${connection.escape(req.params.id)}`;
    issueQuery(query, res, `modifying entry ${req.params.id} for ${uid}`);
  });
  //accessible by admin or if req.params.id matches session id
  //requires ALL in fields to be re-sent in body
  app.post('/entries', function(req,res){
    console.log('request body:');
    console.log(JSON.stringify(req.body));
    let {date, time, text, calories, uid} = sanitizeReqBody(req);
    if (!date || !time || !text || !calories || !uid) {
      res.end(`Error: some fields were incorrect: ${JSON.stringify(req.body)}`);
      return;
    }
    let query = `INSERT INTO entries (date, time, text, calories, uid)
                  VALUES (${date}, ${time}, ${text}, ${calories}, ${uid})`;
    issueQuery(query, res, 'posting an entry for '+uid);
  });
  //accessible by admin or if req.params.id matches session id
  app.delete('/entries/:id', function(req,res){
    let query = `DELETE FROM entries WHERE id=${connection.escape(req.params.id)}`;
    issueQuery(query, res, 'deleting entry with id '+req.params.id);
  });
};
