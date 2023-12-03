const { Transaction } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { APIError } = require('../../utils/app-errors');

class TransactionRepository {

    async CreateTransaction(userId, order) {
        try {
            const transaction = {
                orderId: order.orderId,
                transactionId: order.transactionId,
                status: 'waiting_for_payment',
                channel: ''
            };

            const newTransaction = await Transaction.create(transaction);

            return newTransaction;
        } catch (error) {
            throw new APIError('API Error', 500, 'Unable to create transaction');
            
        }
    }

    async GetTransaction(transactionId) {
        try {
            const transaction = await Transaction.findOne({ transactionId: transactionId });

            if (transaction) {
                return transaction;
            }

            return {};

        } catch (error) {
            throw new APIError('API Error', 500, 'Unable to find transaction');
        }
    }
}

module.exports = TransactionRepository;