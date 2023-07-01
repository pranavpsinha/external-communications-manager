require('dotenv');
const logger = require("easy-logger-2");
const { consumerInstance } = require('./kafka');

async function SubscribeMessage(topic, callback) {
  try {
    // consumer instance allows having option to keep separate groupid for each topic
    const consumer = consumerInstance(topic);

    await consumer.connect();
    await consumer.subscribe({
      topic, 
      fromBeginning: true
    });
    await consumer.run({
      eachMessage: callback,
      autoCommit: true,
      autoCommitInterval: parseInt(process.env.KAFKA_AUTOCOMMIT_INTERVAL_MS || 5000),
      autoCommitThreshold: parseInt(process.env.KAFKA_AUTOCOMMIT_THRESHOLD_N || 1),
      partitionsConsumedConcurrently: parseInt(process.env.KAFKA_CONSUME_PARTITIONS_CONCURRENT_N || 1),
    });

    return consumer;
  } catch (e) {
    logger.error(e.message);
    throw Error(e);
  }
}

module.exports = SubscribeMessage;