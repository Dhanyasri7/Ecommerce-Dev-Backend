const { Client } = require("@elastic/elasticsearch");

const client = new Client({
  node: "https://localhost:9200",
  auth: {
    username: "elastic",
    password: "R=uBuGk0_3U0MNYhpxE3",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

module.exports = client;
