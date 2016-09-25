
const mysql = require('mysql');
const connection = mysql.createConnection(require('../.dbconf.json'));

connection.connect(function(err){
  if(!err){
    console.log("DB is connected");
  }
  else{
    console.log("Error connecting to the DB: ");
    console.log(err);
  }
});

function issueQuery(query, res, errMessage){
  console.log(`Attempting query: \n ${query}`);
  connection.query(query, function(err, rows, fields){
    if (err){
      res.end("Error: "+errMessage+' '+logError(err));
      console.log("Error: "+errMessage+"\n"+err.toString()+"\n");
    }
    else{
      console.log("Rows\n",JSON.stringify(rows));
      console.log('fields:');
      console.log(JSON.stringify(fields));
      res.json(rows);
    }
  });
}

function sanitizeReqBody(req){
  let escapedReqBody = {};
  Object.keys(req.body).forEach(key=>{
    if (req.body[key])
      escapedReqBody[key] = connection.escape(req.body[key]);
  });
  return escapedReqBody;
}

function logError(err){
  if (err.toString().includes('ER_DUP_ENTRY') ) return 'Username already exists.';
}

module.exports = {connection, issueQuery, sanitizeReqBody};
