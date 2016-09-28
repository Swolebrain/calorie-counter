"use strict";
const express = require('express');
const app = express();
const port = 8999;
const bodyparser = require('body-parser');
const path = require('path');
// const cors = require('cors');

//session management
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

// app.use(cors());
app.use(bodyparser.urlencoded({extended: true}));
app.use(bodyparser.json());
app.use(session({
  secret: 'l4kjafkjefbgkjlfdsn4slvd',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    url: 'mongodb://localhost/sessions'
  })
}));
app.use(express.static('static'));

//MAIN ROUTES
app.get('/', function(req, res){
  res.sendFile(path.join(__dirname+'/views/main.html'));
});

//Entries CRUD
require('./services/entries.js')(app);

//Users CRUD
require('./services/users.js')(app);

app.listen(port, ()=>console.log("server listening on port", port));
