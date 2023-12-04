const TransactionService = require('../services/transaction-service');
const isAuth = require('./middlewares/auth'); 
const { APIError } = require('../utils/app-errors');
const kafkaProducer = require('../utils/kafka/kafka_producer');
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
        console.log("req.body:", req.body)

        try {
            const { data } = await service.payForTransaction({ _id, transactionId, channel });
            if (!data || (Object.keys(data).length == 0 && data.constructor == Object)) {

                logger.error(`Failed paying for transaction: data transactionId not found`);
                
                return res.status(404).json({
                    status: "error",
                    message: `Data transactionId ${transactionId} not found`
                })
            }
            console.log("data pay4trx:", data)

            for (const productId of data.productIds) {
                console.log("enter loop with productId", productId)
                let payload = {
                    data: {
                        userId: data.userId,
                        orderId: data.orderId,
                        orderIdOid: data._id,
                        status: data.status,
                        transactionId: transactionId,
                        product: { _id: productId }
                    }
                }
                const dataToKafka = {
                    topic: 'ecommerce-service-pay-transaction',
                    body: payload,
                    partition: 1,
                    attributes: 1
                };
                kafkaProducer.send(dataToKafka);

            }
            console.log("sent all msg to kafka")

            return res.status(200).json({
                status: "success", message: "success",
                data
            })

        } catch (error) {
            if (error instanceof APIError) {
                let statusCode = error.statusCode || 500
                let desc = error.description || "Internal server error"
                return res.status(statusCode).json(desc)
            }
            return res.status(500).json({
                status: "error", message: error
            });
        }
        
    });

    app.get('/transaction', isAuth, async (req, res) => {
        const { _id } = req.user
        try {

            const transaction = await service.getAllTransactions(_id)
            if (transaction && transaction.length <= 0) {
                return res.status(404).json({ status: "success", message: "No transaction" })
            }
            return res.status(200).json({
                status: "success", message: "success",
                data: transaction
            })
        } catch(e) {
            console.log(e)
            logger.error('Failed retrieving transactions');
            return res.status(500).json( {
                status: "error",
                message: "some unexpected happened"
            })
        }
    })

    app.post("/transaction/cancel", isAuth, async(req, res) => {
        logger.info('API POST /transaction/cancel is called');
        const { _id } = req.user
        const { transactionId } = req.body
        try {
            const { message, tx } = await service.cancelTransaction(transactionId)
            if (!tx) {
                return res.status(400).json( { status: "error", message } )
            }
            let payload = {
                data: {
                    userId: _id,
                    transactionId,
                    channel: tx.channel
                }
            }
            const dataToKafka = {
                topic: 'ecommerce-service-cancel-transaction',
                body: { payload: payload},
                partition: 1,
                attributes: 1
            };
            kafkaProducer.send(dataToKafka)
            logger.info('Success sending cancel transaction to kafka');

            logger.info('Success canceling transaction');
            return res.status(200).json({
                status: "success",
                message: 'Success canceling transaction',
                data: {
                    transactionId,
                    transactionDate: tx.transactionDate,
                    status: 'canceled',
                    channel: tx.channel,
                }
            })

        } catch(e) {
            console.log(e)
            logger.error('Failed canceling transaction');
            return res.status(500).json( {
                status: "error",
                message: "Failed canceling transaction"
            })
        }

    })

};