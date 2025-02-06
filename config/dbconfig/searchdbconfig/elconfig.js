const { Client } = require("@elastic/elasticsearch");
require('dotenv').config();

const elClientConfig = new Client({
    node: process.env.ELASTICSEARCH_URL,
    auth: {
      username: process.env.ELASTICSEARCH_USER,
      password: process.env.ELASTICSEARCH_PASSWORD,
    },
  });
  module.exports =elClientConfig;