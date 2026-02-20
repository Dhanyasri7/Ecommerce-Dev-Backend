const client = require("./config/elastic");

async function createIndex() {
  const exists = await client.indices.exists({
    index: "products",
  });

  if (exists) {
    console.log("Index already exists");
    return;
  }

  await client.indices.create({
    index: "products",
    mappings: {
      properties: {
        proname: {
          type: "text",
        },
        description: {
          type: "text",
        },
        price: {
          type: "float",
        },
        catid: {
          type: "integer",
        },
      },
    },
  });

  console.log("Products index created successfully");
}

createIndex();
