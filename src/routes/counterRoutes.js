const express = require('express')
const router = express.Router()
const Counter = require('../models/counterModel')

router.get('/', async (req, res) => {
    try {
        const counter = Counter.find()  
        res.status(200).json(counter)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

module.exports = router