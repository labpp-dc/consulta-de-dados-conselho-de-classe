require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/funcionario');
var anoLetivoRouter = require('./routes/anoLetivo');
var cursoRouter = require('./routes/curso');
var materiaRouter = require('./routes/materia');
var estudanteRouter = require('./routes/estudante');
var relatorioRouter = require('./routes/relatorio');
var turmaRouter = require('./routes/turma');

var app = express();

// CORS para liberar requests do frontend via nginx
app.use(cors({
  origin: ['http://localhost', 'http://127.0.0.1', 'http://localhost:80', 'http://127.0.0.1:80', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/anoLetivo', anoLetivoRouter);
app.use('/curso', cursoRouter);
app.use('/materia', materiaRouter);
app.use('/estudante', estudanteRouter);
app.use('/relatorio', relatorioRouter);
app.use('/turmas', turmaRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
