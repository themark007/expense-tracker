const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');
    
    try {
        const [expenses] = await pool.execute(
            'SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC',
            [req.session.user.id]
        );
        
        const [total] = await pool.execute(
            'SELECT SUM(amount) AS total FROM expenses WHERE user_id = ?',
            [req.session.user.id]
        );
        
        res.render('index', {
            expenses,
            total: total[0].total || 0
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.post('/add', async (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');
    
    try {
        const { description, amount, category, date } = req.body;
        await pool.execute(
            'INSERT INTO expenses (user_id, description, amount, category, date) VALUES (?, ?, ?, ?, ?)',
            [req.session.user.id, description, amount, category, date]
        );
        res.redirect('/expenses');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;