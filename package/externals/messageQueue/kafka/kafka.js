require('dotenv');
const { Kafka, logLevel  } = require('kafkajs');

const { 
  KAFKA_USERNAME: username, 
  KAFKA_PASSWORD: password,
  KAFKA_CLIENT_ID: clientId,
  KAFKA_BROKER: broker,
  KAFKA_MECHANISM: mechanism,
  KAFKA_GROUP_ID: groupId,
} = process.env;
const sasl = username && password ? { username, password, mechanism } : null
const ssl = !!sasl

const kafka = new Kafka({
  clientId: clientId,
  brokers: [ ...(broker || '').split(',').map(x => (x || '').trim()).filter(x => !!x) ],
  ssl,
  sasl,
  logLevel: logLevel.INFO,
});

async function createTopic(topic) {
  const admin = kafka.admin();

  await admin.connect();
  await admin.createTopics({
    topics: [{
      topic,
    }]
  });
  await admin.disconnect();
}

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId });

module.exports = {
  consumer,
  consumerInstance: (tag) => (new Kafka({
    clientId,
    brokers: [ ...(broker || '').split(',').map(x => (x || '').trim()).filter(x => !!x) ],
    ssl,
    sasl,
    logLevel: logLevel.INFO,
  })).consumer({
    groupId: `${groupId}${tag ? `-${tag}` : '' }`,
    allowAutoTopicCreation: true,
  }),
  producer,
  createTopic,
}