const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// Login Page
router.get('/login', (req, res) => {
    res.render('auth/login');
});

// Register Page
router.get('/register', (req, res) => {
    res.render('auth/register');
});

// Register Handle
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await pool.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );
        
        req.flash('success', 'You are now registered and can log in');
        res.redirect('/auth/login');
    } catch (err) {
        req.flash('error', 'Registration failed');
        res.redirect('/auth/register');
    }
});

// Login Handle
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length === 0) {
            req.flash('error', 'Invalid credentials');
            return res.redirect('/auth/login');
        }
        
        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (isMatch) {
            req.session.user = user;
            res.redirect('/expenses');
        } else {
            req.flash('error', 'Invalid credentials');
            res.redirect('/auth/login');
        }
    } catch (err) {
        req.flash('error', 'Login failed');
        res.redirect('/auth/login');
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
});

module.exports = router;