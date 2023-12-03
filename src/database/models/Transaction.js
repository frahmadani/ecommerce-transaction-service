const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
    
    orderid: String,
    transactionId: String,
    transactionDate: {
        type: Date,
        default: Date.now()
    },
    status: String,
    channel: String
}, {
    toJSON: {
        transform(doc, ret) {
            delete ret.__v;
        }
    },
    timestamps: true

});

module.exports = mongoose.model('Transaction', TransactionSchema);
