var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override'); 
var mongoose = require('mongoose');

var settings = require('./settings'); //≈‰÷√–≈œ¢
var flash = require('connect-flash');
var session = require('express-session');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

app.use(session({
  secret: settings.cookieSecret,  //º”√‹
  key: settings.db, //cookie nam
  cookie: {maxAge: 60000},
  resave: false,
  saveUninitialized: true,
}));
app.use(flash());
// set flash
app.use(function (req, res, next) {
  res.locals.errors = req.flash('error');
  res.locals.infos = req.flash('info');
  next();
});

mongoose.connect('mongodb://localhost/todo_development');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var TaskSchema = new Schema({
 // name: {type:String,validate:[validatePresenceOf,'a task is required']}
 name: { type: String, required: true }
});
var TaskModel = mongoose.model('first',TaskSchema);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride('_method')); 
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.get('/tasks', function(req, res){
  TaskModel.find({}, function (err, docs) {
	console.log(docs);
    res.render('tasks/index', {
      title: 'Todos index view',
      docs: docs
    });
  });
});

app.get('/tasks/new', function(req, res){
  res.render('tasks/new.jade', {
    title: 'New Task'
  });
});

app.post('/tasks', function(req, res){
	// console.log(req.body);
  var task = new TaskModel({
  name:req.body.task
  });
  task.save(function (err) {
    if (!err) { 
	  req.flash('info','Task created');
      res.redirect('/tasks');
    }
    else {
	  req.flash('error','default');
      res.redirect('/tasks/new');
    }
  });
});

app.get('/tasks/:id/edit', function(req, res){
  TaskModel.findById(req.params.id, function (err, doc){
    res.render('tasks/edit', {
      title: 'Edit Task View',
      task: doc
    });
  });
});

app.put('/tasks/:id', function(req, res){
  TaskModel.findById(req.params.id, function (err, doc){
    doc.updated_at = new Date();
	doc.name = req.body.task;
    doc.save(function(err) {
      if (!err){
		req.flash('info','Task edit');
        res.redirect('/tasks');
      }
      else {
        console.err(err);
      }
    });
  });
});

app.delete('/tasks/:id', function(req, res){
  TaskModel.findOne({ _id: req.params.id }, function(err, doc) {
    doc.remove(function() {
	  req.flash('info','Task delete');
      res.redirect('/tasks');
    });
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
