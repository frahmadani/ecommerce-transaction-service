const kafkaConsumer = require('../../utils/kafka/kafka_consumer');
const TransactionService = require('../../services/transaction-service');
const trxSvc = new TransactionService();

const addOrderTransaction = async () => {
    const dataConsumer = {
        topic: 'ecommerce-service-create-order',
        groupId: 'ecommerce-transaction-service'
    };
    const consumer = new kafkaConsumer(dataConsumer);
    let ctx = 'info';
    consumer.on('message', async (message) => {
        try {
            let { payload } = JSON.parse(message.value);
            console.log("payload:", payload)
            let data = payload?.data?.data;
            console.log("data:", data)
            const result = await trxSvc.createOrder(data);

            console.log('Data diterima: ', message);

            console.log('Value: ', JSON.parse(message.value));
            if (result.err) {
                console.log(ctx, result.err, 'Data not commit Kafka');
            } else {
                consumer.commit(true, async (err, data) => {
                    if (err) {
                        console.log(ctx, err, 'Data not commit Kafka');
                    }
                      console.log(ctx, data, 'Data Commit Kafka');
                });
            }
        } catch (error) {
              console.log(ctx, error, 'Data error');
        }
    });
};


module.exports = {
    addOrderTransaction
};