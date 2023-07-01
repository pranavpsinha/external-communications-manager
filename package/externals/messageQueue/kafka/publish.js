const logger = require("easy-logger-2");
const { createTopic, producer } = require('./kafka');

async function PublishMessage(topic, message, isMulti = false) {
  let publishedMessage = false;
  
  try {
    await createTopic(topic);
  } catch (e) {
    logger.warn(`[MQ:Kafka] => ${e.message}`);
  }

  try {
    message.headers = { ...message.headers, key: message.key }
  } catch (e) {
    logger.warn(`[MQ:Kafka] => Failed to bind metadata to message --${e.message}`);
  }

  try {
    await producer.connect();
    await producer.send({
      topic, 
      messages: isMulti ? message : [message],
    });
    await producer.disconnect();
    publishedMessage = true;

    const msgStr = JSON.stringify(message);
    logger.info(`[MQ:Kafka] Message [${msgStr.substr(0,30)}${msgStr.length > 30 ? '...' : ''}] published to [${topic}]`);

  } catch (e) {
    logger.error(`[MQ:Kafka] => ${e.message}`);
    throw Error(e);
  }

  return publishedMessage;
}

module.exports = PublishMessage;