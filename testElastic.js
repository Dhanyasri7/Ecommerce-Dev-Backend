const client = require("./config/elastic");

async function test() {
  const info = await client.info();
  console.log(info);
}

test();
