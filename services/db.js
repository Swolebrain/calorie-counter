
const mysql = require('mysql');
const dbconf = require('../.dbconf.json');
let connection = mysql.createConnection(dbconf);

connection.connect(dbConnectionLogger);

connection.on("error", function (err) {
  if (!err.fatal) {
    return;
  }
  if (err.code !== "PROTOCOL_CONNECTION_LOST") {
    throw err;
  }
  connection = mysql.createConnection(dbconf);
  connection.connect(dbConnectionLogger);
});

function issueQuery(query, res, errMessage, cb){
  console.log(`Attempting query: \n ${query}`);
  connection.query(query, function(err, rows, fields){
    if (err){
      res.end("Error: "+errMessage+' '+logError(err));
      console.log("Error: "+errMessage+"\n"+err.toString()+"\n");
    }
    else{
      console.log("Rows\n",JSON.stringify(rows));
      // console.log('fields:');
      // console.log(JSON.stringify(fields));
      if (!cb && !err)
        return res.json(rows);
      cb(err, rows);
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

function dbConnectionLogger(err){
  if(!err){
    console.log("DB is connected");
  }
  else{
    console.log("Error connecting to the DB: ");
    console.log(err);
    process.exit(1);
  }
}

function getConnection(){
  return connection;
}

function esc(str){
  return connection.escape(str);
}

module.exports = {getConnection, issueQuery, sanitizeReqBody, esc};
