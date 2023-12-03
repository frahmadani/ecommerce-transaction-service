const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
    
    orderId: String,
    transactionId: String,
    transactionDate: {
        type: Date,
        default: Date.now()
    },
    userId: String,
    status: String,
    channel: String,
    productIds: [String]
}, {
    toJSON: {
        transform(doc, ret) {
            delete ret.__v;
        }
    },
    timestamps: true

});

module.exports = mongoose.model('Transaction', TransactionSchema);
