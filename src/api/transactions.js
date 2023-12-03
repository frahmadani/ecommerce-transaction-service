const TransactionService = require('../services/transaction-service');
const isAuth = require('./middlewares/auth'); 
const { APIError } = require('../utils/app-errors');
const kafkaProducer = require("../utils/kafka/kafka_producer");
const logger = require('../utils/app-logger');


module.exports = async (app, trxSvc) => {

    let service;
    if (trxSvc) {
        service = trxSvc;
    } else {
        service = new TransactionService();
    }

    app.post('/transaction/pay', isAuth, async (req, res, next) => {
        logger.info('API POST /transaction/pay is called')
        
        const { _id } = req.user;
        const { transactionId, channel } = req.body;

        try {
            const { data } = await service.payForTransaction({ _id, transactionId, channel });
            if (!data || (Object.keys(data).length == 0 && data.constructor == Object)) {

                logger.error(`Failed paying for transaction: ${error}`);
                
                return res.status(404).json({
                    message: `Data transactionId ${transactionId} not found`
                })
            }
            console.log("data pay4trx:", data)

            for (const productId of data.productIds) {
                console.log("enter loop with productId", productId)
                let payload = {
                    data: {
                        userId: data.userId,
                        product: { _id: productId }
                    }
                }
                const dataToKafka = {
                    topic: 'ecommerce-service-remove-from-cart',
                    body: payload,
                    partition: 1,
                    attributes: 1
                };
                kafkaProducer.send(dataToKafka);

            }
            console.log("sent all msg to kafka");

            return res.status(200).json(data);

        } catch (error) {
            if (error instanceof APIError) {
                let statusCode = error.statusCode || 500
                let desc = error.description || "Internal server error"

                logger.error(`Failed paying for transaction: ${error}`);
                return res.status(statusCode).json(desc)
            }
            logger.error(`Failed paying for transaction: ${error}`);
            return res.status(500).json(error);
        }
        
    });

};