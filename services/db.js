
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

module.exports = connection;
