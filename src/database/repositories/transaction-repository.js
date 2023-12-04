const { Transaction } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { APIError } = require('../../utils/app-errors');

class TransactionRepository {

    async CreateTransaction(userId, transactionId, order) {
        try {
            const transaction = {
                orderId: order?.orderId,
                transactionId: transactionId,
                userId: userId,
                status: 'waiting_for_payment',
                productIds: order?.items?.map(item => item?.product?._id),
                channel: null
            };

            const newTransaction = await Transaction.create(transaction);
            console.log("newTransaction:", newTransaction)
            return newTransaction;
        } catch (error) {
            console.log("error:", error)
            throw new APIError('API Error', 500, 'Unable to create transaction');
            
        }
    }

    async GetTransactionById(txId) {
        try {
            return await Transaction.findOne({ transactionId: txId })
        } catch(error) {
            console.log(error)
            throw new APIError("Get Transaction By Id", 500, error)
        }
    }

    async GetUnpaidTransaction(transactionId) {
        try {
            const transaction = await Transaction.findOne({ transactionId: transactionId,
                "$and": [{ status: { "$not": { "$eq": "paid" }}}]
             });

            if (transaction) {
                return transaction;
            }

            return {};

        } catch (error) {
            throw new APIError('API Error', 500, 'Unable to find transaction');
        }
    }

    async GetAllTransaction(userId) {
        try {
            if (userId) {
                return await Transaction.find({ userId: userId })
            }
            return await Transaction.find();
        } catch(e) {
            console.log(e)
            throw new APIError("Get All Transaction", 500, e)
        }
    }
}

module.exports = TransactionRepository;