const { TransactionRepository } = require('../database');

const { formattedData } = require('../utils');
const { APIError } = require('../utils/app-errors');

class TransactionService {

    constructor(trxRepo) {
        if (trxRepo) {
            this.repository = trxRepo;
        } else {
            this.repository = new TransactionRepository();
        }
    }

    async createOrder(userInput) {
        let { userId, transactionId, order } = userInput;
        let result = {}
        try {
            result = await this.repository.CreateTransaction(userId, transactionId, order);
        } catch(e) {
            console.log(e)
            result.err = e
            throw new APIError(e)
        }
        return result
    }
    async payForTransaction(userInputs) {
        let { _id, transactionId, channel } = userInputs;

        try {
            const transaction = await this.repository.GetTransaction(transactionId);
            if (!transaction ||
                (Object.keys(transaction).length == 0 && transaction.constructor == Object))
            {
                return {}
            }

            transaction.status = 'paid';
            if (channel && !(channel === 'bank_payment' || channel === 'cash')) {
                console.log(channel, " either not bank_payment or not cash")
                channel = 'unspecified_payment_channel';
            }
            transaction.channel = channel;
            transaction.save();

            return formattedData(transaction);

        } catch (error) {
            console.log("error pay4trx:", error)
            if (error instanceof APIError) {
                throw error
            }
            throw new APIError('Internal server error', 500, error);
        }
    }
}

module.exports = TransactionService;