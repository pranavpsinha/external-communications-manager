module.exports = {
  cache: require('./cache/redis'),
  hdd: require('./hdd/local'),
  aws: require('./aws/s3'),
}