const TransactionSchema = require('../models/transactionModel')

const CreateTransaction = async (req, res) => {
    const { userId, username, amount, status, category } = req.body

    try {
        if (!userId || !username || !amount || !status || !category) {
            return res.status(400).json({ message: 'All fields are required' })
        }
        // Create a new transaction
        const transaction = await TransactionSchema.create({
            userId,
            username,
            amount,
            status,
            category
        })

        res.status(201).json({
            message: 'Transaction created successfully',
            transaction
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}

const getTransactions = async (req, res) => {
    try {
        const transactions = await TransactionSchema.find()
        res.status(200).json(transactions)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}

const getTransactionById = async (req, res) => {
    const { id } = req.params

    try {
        const transaction = await TransactionSchema.findById(id)

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' })
        }

        res.status(200).json(transaction)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}

// Update a transaction
const updateTransaction = async (req, res) => {
    const { id } = req.params
    const { userId, username, amount, status, category } = req.body

    try {
        // Find the transaction by ID and update it
        const updatedTransaction = await TransactionSchema.findByIdAndUpdate(
            id,
            { userId, username, amount, status, category },
            { new: true, runValidators: true }
        )

        if (!updatedTransaction) {
            return res.status(404).json({ message: 'Transaction not found' })
        }

        res.status(200).json({
            message: 'Transaction updated successfully',
            transaction: updatedTransaction
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}

// Delete a transaction
const deleteTransaction = async (req, res) => {
    const { id } = req.params

    try {
        const transaction = await TransactionSchema.findByIdAndDelete(id)

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' })
        }

        res.status(200).json({
            message: 'Transaction deleted successfully',
            transaction
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}

module.exports = {
    CreateTransaction,
    getTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction
}
