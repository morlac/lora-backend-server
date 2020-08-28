/**
 *
 */
var compression = require('compression');

var createError = require('http-errors');
var express = require('express');
var exphbs = require('express-handlebars');
var favicon = require('serve-favicon');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var dateFormat = require('dateformat');

var indexRouter = require('./routes/index');

var ttnmapperRouter = require('./routes/ttnmapper');

var loraplaRouter = require('./routes/lorapla');

var app = express();

var hbs = exphbs.create({
        defaultLayout: 'main',
        helpers: {
                eq: function (v1, v2) {
                        return v1 === v2;
                },
                ne: function (v1, v2) {
                        return v1 !== v2;
                },
                lt: function (v1, v2) {
                        return v1 < v2;
                },
                gt: function (v1, v2) {
                        return v1 > v2;
                },
                lte: function (v1, v2) {
                        return v1 <= v2;
                },
                gte: function (v1, v2) {
                        return v1 >= v2;
                },
                and: function (v1, v2) {
                        return v1 && v2;
                },
                or: function (v1, v2) {
                        return v1 || v2;
                },
                //https://funkjedi.com/technology/412-every-nth-item-in-handlebars/
                grouped_each: function(every, context, options) {
                        var out = "", subcontext = [], i = 0;

                        if (context === Object(context)) {
                                Object.keys(context).forEach(function(key) {
                                        subcontext.push(context[key]);
                                        i++;

                                        if ((i % every) === 0) {
                                                out += options.fn(subcontext);
                                                subcontext = [];
                                                i = 0;
                                        }
                                });

                                out += options.fn(subcontext);
                        } else {
                                if (context && (context.length > 0)) {
                                        for (i = 0; i < context.length; i++) {
                                                if ((i > 0) && (i % every === 0)) {
                                                        out += options.fn(subcontext);
                                                        subcontext = [];
                                                }

                                                subcontext.push(context[i]);
                                        }

                                        out += options.fn(subcontext);
                                }
                        }

                        return out;
                },
                formatDate: function(timestamp, format) {
//                      util.log(__file + "(" + __line + "): " + __func + ": " + util.inspect(format));
                        var date = new Date(timestamp);

                        return dateFormat(timestamp, format);
                },
                selected: function (v1, v2) {
                        console.log('v1: ' + v1 + ' v2: ' + v2);
                        return v1 === v2 ? ' selected ' : '';
                },
                getErrorOptions: function (v1, v2) {
                        console.log('v1: ' + v1 + ' v2: ' + v2);
                        var result = '';

                        Object.keys(v1).forEach(function(key) {
                                result += '<option value="' + key + '"' + (key == v2 ? ' selected ': '') + '>' + key + ' - ' + v1[key] + '</option>';
                        });

                        return result;
                }
        },
});


app.use(compression());

// view engine setup
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use(favicon(path.join(__dirname, 'public/img', 'favicon.ico')));

app.use('/', indexRouter);
app.use('/lorapla', loraplaRouter);
app.use('/ttnmapper', ttnmapperRouter);

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

