const db = require("./config/db");
const client = require("./config/elastic");

async function syncProducts() {
  db.query("SELECT * FROM products", async (err, results) => {
    if (err) {
      console.error(err);
      return;
    }

    for (const product of results) {
      await client.index({
        index: "products",
        id: product.proid,
        document: {
          proname: product.proname,
          description: product.description,
          price: product.price,
          catid: product.catid,
          image: product.image
        },
      });
    }

    console.log("All products indexed successfully");
  });
}

syncProducts();
