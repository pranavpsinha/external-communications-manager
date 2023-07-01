const httpsRef        = require('https');
const axiosHTTP       = require('axios');
const logger          = require('easy-logger-2');
const axiosConnection = axiosHTTP.default;
const axiosRetry      = require('axios-retry');
const axiosHTTPS      = axiosConnection.create({
  httpsAgent: new httpsRef.Agent({
    rejectUnauthorized: false
  })
});

const defaultRetryCount = +process.env.API_FAIL_DEFAULT_RETRY_COUNT || 3;
axiosRetry(axiosHTTP , { retries: defaultRetryCount, retryDelay: axiosRetry.exponentialDelay });
axiosRetry(axiosHTTPS, { retries: defaultRetryCount, retryDelay: axiosRetry.exponentialDelay });

function reportApiFailure({ url, headers, data }, { isAxiosError, response }) {
  try {
    const { MessageQueue } = require('../externalsManager');
    const error = {
      isAxiosError,
      response: {
        data: response?.data || response,
        headers: response?.headers,
        status: response?.status,
        statusText: response?.statusText,
      }
    }

    MessageQueue.Kafka.publish(process.env.MQTOPIC_API_FAIL_ALERT || 'apicallfailed', {
      key: String(Date.now()),
      value: JSON.stringify({ url, headers, data, error }),
      headers: {
        source: "event-manager",
        action: "logging",
        type: "api-call",
        "spring_json_header_types": JSON.stringify({ "type": "java.lang.String" })
      },
    });
  } catch (e) {
    logger.error(`[AXIOS] --> ${e.message}`);
  }

  return true;
}

function _interface(caller) {
  return {
    get: async function (url, headers, data, unsafe = false) {
      let r;

      if(unsafe) {
        r = await caller.get(url, { headers, data });
      } else {
        try {
          const APITimeoutPromise = new Promise((_resolve, reject) => {
            setTimeout(() => { reject(new Error('API Request timed out')); }, parseInt(process.env.API_ABORT_REQUEST_AFTER_MS || 15000));
          });

          r = await Promise.race([
            caller.get(url, { headers, data }),
            APITimeoutPromise
          ]);
        } catch (e) {
          logger.error(`[AXIOS] --> ${e.message}`);

          r = e.response || e.message;
  
          if(!!process.env.API_FAIL_SHOULD_NOTIFY_KAFKA) {
            reportApiFailure({ url, headers, data }, e);
          }
        }
      }

      return r;
    },

    post: async function (url, headers, data, unsafe = false) {
      let r;

      if(unsafe) {
        r = await caller.post(url, data, { headers });
      } else {
        try {
          const APITimeoutPromise = new Promise((_resolve, reject) => {
            setTimeout(() => { reject(new Error('API Request timed out')); }, parseInt(process.env.API_ABORT_REQUEST_AFTER_MS || 15000));
          });

          r = await Promise.race([
            caller.post(url, data, { headers }),
            APITimeoutPromise
          ]);
        } catch (e) {
          logger.error(`[AXIOS] --> ${e.message}`);

          r = e.response || e.message;
  
          if(!!process.env.API_FAIL_SHOULD_NOTIFY_KAFKA) {
            reportApiFailure({ url, headers, data }, e);
          }
        }
      }

      return r;
    },

    patch: async function(url, headers, data, unsafe = false) {
      let r;

      if(unsafe) {
        r = await caller.patch(url, data, { headers });
      } else {
        try {
          const APITimeoutPromise = new Promise((_resolve, reject) => {
            setTimeout(() => { reject(new Error('API Request timed out')); }, parseInt(process.env.API_ABORT_REQUEST_AFTER_MS || 15000));
          });

          r = await Promise.race([
            caller.patch(url, data, { headers }),
            APITimeoutPromise
          ]);
        } catch (e) {
          logger.error(`[AXIOS] --> ${e.message}`);

          r = e.response || e.message;
  
          if(!!process.env.API_FAIL_SHOULD_NOTIFY_KAFKA) {
            reportApiFailure({ url, headers, data }, e);
          }
        }
      }

      return r;
    },

    put: async function(url, headers, data, unsafe = false) {
      let r;

      if(unsafe) {
        r = await caller.put(url, data, { headers });
      } else {
        try {
          const APITimeoutPromise = new Promise((_resolve, reject) => {
            setTimeout(() => { reject(new Error('API Request timed out')); }, parseInt(process.env.API_ABORT_REQUEST_AFTER_MS || 15000));
          });
          
          r = await Promise.race([
            caller.put(url, data, { headers }),
            APITimeoutPromise
          ]);
        } catch (e) {
          logger.error(`[AXIOS] --> ${e.message}`);
          
          r = e.response || e.message;
  
          if(!!process.env.API_FAIL_SHOULD_NOTIFY_KAFKA) {
            reportApiFailure({ url, headers, data }, e);
          }
        }
      }

      return r;
    },

    delete: async function (url, headers, data, unsafe = false) {
      let r;

      if(unsafe) {
        r = await caller.delete(url, { headers, data });
      } else {
        try {
          const APITimeoutPromise = new Promise((_resolve, reject) => {
            setTimeout(() => { reject(new Error('API Request timed out')); }, parseInt(process.env.API_ABORT_REQUEST_AFTER_MS || 15000));
          });

          r = await Promise.race([
            caller.delete(url, { headers, data }),
            APITimeoutPromise
          ]);
        } catch (e) {
          logger.error(`[AXIOS] --> ${e.message}`);

          r = e.response || e.message;
  
          if(!!process.env.API_FAIL_SHOULD_NOTIFY_KAFKA) {
            reportApiFailure({ url, headers, data }, e);
          }
        }
      }

      return r;
    },
  }
}

const http  = _interface(axiosHTTP);
const https = _interface(axiosHTTPS);

module.exports = {
  http,
  https,
}