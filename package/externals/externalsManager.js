module.exports = {
  Context: require('./storage/disk/cache/memoryCache'),
  MessageQueue: require('./messageQueue/mq'),
  Mailer: require('./mailer/mailer'),
  ResourceAPI: require('./api/axios'),
  Storage: {
    disk: require('./storage/disk/diskStorage'),
  }
}