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

//Records CRUD
require('./services/entries.js')(app);

app.listen(port, ()=>console.log("server listening on port", port));
