const orderEventHandler = require('../api/handler/event_handler');
// const logger = require('./app-logger');

const init = () => {
  console.log('info', 'Observer is Running...', 'myEmitter.init');
  initEventListener();
};
const initEventListener = () => {
  orderEventHandler.addOrderTransaction();
};

module.exports = {
  init: init,
};
