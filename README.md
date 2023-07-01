# External Communications Manager

Wrapper for your all the external communication you'll need for your applications. Hope you will love the flavour.

## Installation

You can install the External Communications Manager package from npm using the following command:

```shell
npm install external-communications-manager
```
[external-communications-manager](https://www.npmjs.com/package/external-communications-manager/v/1.0.7?activeTab=versions)

## Summary
There are many feature embedded into this one single package viz.
```shell
1. API via axios
2. Mailer
  2.1 Email via aws-sdk
  2.2 SMS via 2factor
3. Message Queue via Kafka
4. Storage
  4.1 AWS-S3 Bucket via aws-sdk and multer
  4.2 Cache
    4.2.1 Redis
    4.2.2 Context Memory - Redis [and if redis instance missing, in memory context]
  4.3 Local Hard Disk (HDD) via multer
  4.4 SFTP via multer-sftp
```

# Usage Guidelines
## API
### Default ENV Configurations
```shell
# how many times should the api call be tried before declaring failed and returning error response
API_FAIL_DEFAULT_RETRY_COUNT = 3
# should a message be published to topic in case api fails 1/0 where 0 is false and non-0+ is true
API_FAIL_SHOULD_NOTIFY_KAFKA = 0
# if api call is failed, which topic should the details be published to
MQTOPIC_API_FAIL_ALERT = apicallfailed
# after how many seconds the request to be aborted, to avoid waiting forever and blocking main thread (in miliseconds)
API_ABORT_REQUEST_AFTER_MS = 15000
```
### Usage Example
```shell
const { ResourceAPI } = require('external-communications-manager');

# returns promise, thus must be awaited
# https
(await ResourceAPI.https.get(someURL, headers, data)).data;
(await ResourceAPI.https.patch(someURL, headers, data)).data;
(await ResourceAPI.https.put(someURL, headers, data)).data;
(await ResourceAPI.https.post(someURL, headers, data)).data;
(await ResourceAPI.https.delete(someURL, headers, data)).data;
#http
const getResp = (await ResourceAPI.http.get(someURL, headers, data)).data;
const patchRespRaw = await ResourceAPI.http.patch(someURL, headers, data);
const patchRes = patchRespRaw.data;
(await ResourceAPI.http.put(someURL, headers, data)).data;
(await ResourceAPI.http.post(someURL, headers, data)).data;
(await ResourceAPI.http.delete(someURL, headers, data)).data;
# since http-responses-2 has a response structure like { data, metadata, status, message, ... }
# to actually access the data key from the response, you may have to use it like
const responseData = (await ResourceAPI.https.get(someURL, headers, data)).data?.data;
# where first .data is to obtain data from axios's response, and seconds .data is to get data key from response
const responseMetadata = (await ResourceAPI.https.get(someURL, headers, data)).data?.metadata;
```

## Mailer
### Default ENV Configurations
```shell
# EMAIL
AWS_KEY         = 
AWS_API_VERSION = 2010-12-01
AWS_SECRET      = 
AWS_SES_REGION  = us-west-2
# sender's email
AWS_FROM        = hello@world.com
# can accommodate multiple comma separated emails, automatically filters out empty entries and trims extra spaces
AWS_REPLY       = hello@world.com

# SMS --supports international numbers --replace MY_TEMPLATE_NAME with appropriate template name
TWOFACTOR_API_URL = https://2factor.in/API/V1/{{accessKey}}/SMS/{{contact}}/{{passkey}}/MY_TEMPLATE_NAME
TWOFACTOR_ACCESS_KEY = 
```
### Usage Example
```shell
const {
  Mailer
} = require('external-communications-manager');

# Email - returns promise, 
## arguments, 
## second -> whether the content is html or plain text [isHTML], default false if not passed
## if multiple emails, use emails[] else email, if emails is passed, email will be ignored
Mailer.email.send({
  emails : void 0,
  email  : 'hello@world.com',
  subject: 'Some Subject',
  body   : 'Some body message, either simple text or html, if html, pass second argument as true',
}, false);
# please note: some css properties may be blocked by email clients like background etc, you should still be able to include images via <img> tag from public/cdn sources
Mailer.email.send({
  emails : void 0,
  email  : 'hello@world.com',
  subject: 'Some Subject',
  body   : '<!DOCTYPE html><html><head><title>Page Title</title></head><body><h1>This is a Heading</h1><p>This is a paragraph.</p></body></html>',
}, true);

# SMS - returns promise
Mailer.sms.send({
  mobile: `receiver's mobile, replaces {{contact}} in 2factor api-url`,
  from: 'from',
  template: 'template-name',
  var1: 'replaces {{passkey}}',
  var2: 'if template has any other variable to be replaced',
  var3: 'if template has any other variable to be replaced'
})
```

## Message Queue
### Default ENV Configurations
```shell
## MESSAGE QUEUE
# KAFKA - BROKER can be given multiple (comma separated), groupid is mandatory
KAFKA_USERNAME  = 
KAFKA_PASSWORD  = 
KAFKA_CLIENT_ID = myapp
# can be comma separated, spaces will be trimmed, empty entries will be filtered out
KAFKA_BROKER    = <ip1>:<port1>,<ip2,port2>,...so on
KAFKA_MECHANISM = plain
KAFKA_GROUP_ID  = mygroup
```
### Usage Example
```shell
const { MessageQueue } = require('external-communications-manager');

# publish --returns promise
MessageQueue.Kafka.publish('some-topic-name', {
  key: String(Date.now()), // or any unique identifier
  value: JSON.stringify({}), //any valid JSON data in stringified form
  headers: { //good to add metadata for better debugging later on
    source: "myapp",
    action: "test",
    type: "registration"
  },
});
# subscribe - returns promise
MessageQueue.Kafka.subscribe('some-topic-name', function() {
  //callback function
});
```
## Storage
### Default ENV Configurations
```shell
###
## AWS S3 BUCKET
###
AWS_S3_API_VERSION    = 2006-03-01
AWS_ACCESS_KEY        = 
AWS_SECRET_ACCESS_KEY = 
AWS_S3_REGION         = ap-south-1
AWS_S3_DEFAULT_BUCKET = mybucket
AWS_MAX_FILE_SIZE     = 40960
###
## HDD
###
FS_LOCAL_TEMP_DIR = data/temp/myfiles/
###
## REDIS
###
REDIS_HOST     = <ip>
REDIS_PORT     = <port>
REDIS_PWD      =
# General properties - if not passed, takes 'PNG', 'JPG', 'JPEG','MP4','WMV'
FS_ALLOWED_EXTENSIONS = png,jpeg,svg,mp4
# to control maximum number of files being uploaded
FS_MAX_ALLOWED_FILES = 1
```
### Usage Example
```shell
const Response = require('http-responses-2');
const { Storage } = require('external-communications-manager');

# function to provide some logic to override file name before saving
let fileCount = 1;
const fileNaming = async (req, file, cb) => {
  try {
    const prefix   = String(new Date().getTime());
    const fileExt  = file.originalname.split('.').pop();
    const fileName = `${prefix}-${fileCount}.${fileExt}`;
    fileCount     += 1;
    cb(null, fileName);
  } catch (e) {
    cb(new Error(e.message));
  }
}
# function to puf some validations on the file being uploaded
const validation = async (req, file, cb) => {
  try {
    const validExts  = (process.env.FS_ALLOWED_EXTENSIONS || '').split(',').map(e => e.trim().toUpperCase()).filter(x => x);
    const fileExt    = file.originalname.split('.').pop();
    const isValidExt = (validExts.length > 0 ? validExts : ['PNG', 'JPG', 'JPEG','MP4','WMV']).includes((fileExt || '').toUpperCase());
    const isValidCnt = fileCount <= +process.env.FS_MAX_ALLOWED_FILES;
    
    if(!isValidExt) throw Error('Invalid file type');
    else if(!isValidCnt) throw Error('Too many files');
    
    cb(null, true);
  } catch (e) {
    cb(new Error(e.message));
  }
}
# identify upload target based on env property or mention directly example below,
const uploadTarget = 'HDD';

let RemoteFileSystemUploader;    
if('AWS' === uploadTarget) {
  RemoteFileSystemUploader = Storage.disk.aws(fileNaming, validation).any();
} else if('HDD' === uploadTarget) {
  RemoteFileSystemUploader = Storage.disk.hdd(fileNaming, validation, process.env.FS_LOCAL_TEMP_DIR).any();
} else if('SFTP' === uploadTarget) {
  // due to a package limitation, currently have removed SFTP, will try to write a neater package code and bring it back
  RemoteFileSystemUploader = Storage.disk.sftp(fileNaming, validation).any();
}

if(RemoteFileSystemUploader) {
  await RemoteFileSystemUploader(req, res, async function(err) {
    if (err) {
      logger.error(`[UPLOADER] File upload failed => ${err.message}`);
      res.status(Response.error.InvalidRequest.code).json(Response.error.InvalidRequest.json(err.message));
    } else {
      // do whatever you wish after uploading file

      return res.status(Response.success.Ok.code).json(Response.success.Ok.json({
        message: 'Form submitted successfully!'
      }));
    }
  });
}
```

### Note
This package will help you streamline all external accesses like api, message-queue, file uploads etc. Import and make use of it. As simple as that.

This is my way of giving back to the community in my own capacity. I know for a fact that the coding standard is terrible as per package standards, and I am determined to scale my packages with better code and even better in-code documentation and readme. Till then, bear with me and build great things. Ciao!