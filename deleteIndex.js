const client = require("./config/elastic");

async function deleteIndex() {
  await client.indices.delete({ index: "products" });
  console.log("Index deleted");
}

deleteIndex();
