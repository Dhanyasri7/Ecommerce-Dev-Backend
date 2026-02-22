const client = require("./config/elastic");

async function createIndex() {
  try {
    const exists = await client.indices.exists({
      index: "products",
    });

    if (exists) {
      console.log("Index already exists");
      return;
    }

    await client.indices.create({
      index: "products",
      settings: {
        analysis: {
          analyzer: {
            autocomplete_analyzer: {
              tokenizer: "standard",
              filter: ["lowercase"]
            }
          }
        }
      },
      mappings: {
        properties: {
          proname: {
            type: "text",
            analyzer: "standard"
          },
          description: {
            type: "text",
            analyzer: "standard"
          },
          price: {
            type: "float"
          },
          catid: {
            type: "integer"
          },
          image: {
            type: "keyword"
          }
        }
      }
    });

    console.log("Products index created successfully");
  } catch (error) {
    console.error("Error creating index:", error);
  }
}

createIndex();