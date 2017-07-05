// 3rd party
const express = require('express');
const bodyParser = require('body-parser');
const expressSession = require('express-session');
require('dotenv').load();

// ours
const hbs = require('./hbs');
const errorHandler = require('./routes/error');

// start to configure server
const app = express();
app.disable('x-powered-by');
app.enable('trust proxy');

const render = hbs.express3({
  extname: '.html',
  defaultLayout: __dirname + '/../views/layout.html',
  partialsDir: [__dirname + '/../views/partials'],
});
app.engine('html', render);
app.engine('svg', render);
app.set('views', __dirname + '/../views');
app.set('view engine', 'html');
app.set('json spaces', '  ');

app.use('/static', express.static(__dirname + '/../public'));

const sessionMiddleware = expressSession({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET || 'please-change-me',
  name: 'id',
  httpOnly: true, // client can't see cookie
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day, change as you feel fit
  },
  secure: 'auto',
});

app.use((req, res, next) => {
  // only add the session to non-api requests
  if (req.headers.authorization) {
    return next();
  }

  return sessionMiddleware(req, res, next);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(errorHandler); // throw errors
app.use(require('./routes')); // mount the router
app.use((req, res, next) => {
  next(404);
});
app.use(errorHandler); // handled errors with next(401) etc

app.locals.env = process.env; // expose this for convenience

const server = app.listen(process.env.PORT || 8000, () => {
  console.log(`listening on http://localhost:${server.address().port} @ ${new Date().toJSON().split('T')}`);
});
