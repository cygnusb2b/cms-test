const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const compression = require('compression');

const loadErrorHandlers = require('./error-handlers');

const app = express();
const port = process.env.PORT || 8888;

// @see https://expressjs.com/en/advanced/best-practice-security.html#use-helmet
// @see https://github.com/helmetjs/helmet
app.use(helmet());

// Should be replaced with a reverse proxy in production!
// @see https://expressjs.com/en/advanced/best-practice-performance.html#proxy
// @see https://github.com/expressjs/compression
app.use(compression({
  level: 6,
  memLevel: 8,
}));

// Parse JSON bodies.
// @see https://github.com/expressjs/body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', require('./api'));

loadErrorHandlers(app);

app.listen(port);
process.stdout.write(`API server listening on port ${port}\n`);
