require('dotenv');
const AWS = require('aws-sdk');

async function send(data, isHTML = false) {
  AWS.config.update({
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
    region: process.env.AWS_SES_REGION || 'us-west-2',
    correctClockSkew: true,
  });

  const Body = isHTML ? { 
    Html: {
      Charset: 'UTF-8',
      Data: data.body,
    }
  } : {
    Text: {
      Charset: "UTF-8",
      Data: data.body
    }
  };

  const params = {
    Destination: {
      ToAddresses: data.emails || [data.email],
    },
    Message: {
      Body,
      Subject: {
        Charset: 'UTF-8',
        Data: data.subject,
      },
    },
    Source: process.env.AWS_FROM,
    ReplyToAddresses: (process.env.AWS_REPLY || '').split(',').map(e => (e || '').trim()).filter(x => x),
  };

  return new AWS.SES({ apiVersion: process.env.AWS_API_VERSION || '2010-12-01' }).sendEmail(params).promise();
}

module.exports = { send };