const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const path = require('path');
const pool = require('./config/db');

const app = express();
const port = process.env.PORT || 3000;

// Session configuration
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(flash());
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    res.locals.messages = req.flash();
    next();
});

// ... rest of previous app.js setup
app.use('/auth', require('./routes/auth'));
app.use('/expenses', require('./routes/expenses'));