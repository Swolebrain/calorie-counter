"use strict";
const express = require('express');
const app = express();
const port = 8999;
const bodyparser = require('body-parser');
const cors = require('cors');

app.use(cors());
app.use(bodyparser.urlencoded({extended: true}));


app.get('/', function(req,res){
  res.end('this will be the login page');
});

//Entries CRUD
require('./services/entries.js')(app);

//Users CRUD
require('./services/users.js')(app);

app.listen(port, ()=>console.log("server listening on port", port));
