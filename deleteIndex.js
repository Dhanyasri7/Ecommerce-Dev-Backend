const client = require("./config/elastic");

async function deleteIndex() {
  try {
    const exists = await client.indices.exists({ index: "products" });

    if (!exists) {
      console.log("Index does not exist");
      return;
    }

    await client.indices.delete({ index: "products" });
    console.log("Index deleted successfully");
  } catch (error) {
    console.error("Error deleting index:", error);
  }
}

deleteIndex();