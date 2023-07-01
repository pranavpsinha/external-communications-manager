module.exports = {
  Kafka: {
    publish: require('./kafka/publish'),
    subscribe: require('./kafka/subscribe'),
  }
}