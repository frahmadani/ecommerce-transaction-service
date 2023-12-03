const orderEventHandler = require('../api/handler/event_handler');
// const logger = require('../helpers/utils/logger');

const init = () => {
    // logger.log('info','Observer is Running...','myEmitter.init');
    initEventListener();
};
const initEventListener = () => {
    orderEventHandler.addOrder();
};

module.exports = {
    init: init
};
