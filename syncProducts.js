const db = require("./config/db");
const client = require("./config/elastic");

async function syncProducts() {
  db.query("SELECT * FROM products", async (err, results) => {
    if (err) {
      console.error(err);
      return;
    }

    try {
      const body = results.flatMap((product) => [
        { index: { _index: "products", _id: product.proid } },
        {
          proname: product.proname,
          description: product.description,
          price: product.price,
          catid: product.catid,
          image: product.image
        }
      ]);

      await client.bulk({
        refresh: true,
        body
      });

      console.log("All products indexed successfully 🚀");
    } catch (error) {
      console.error("Bulk indexing error:", error);
    }
  });
}

syncProducts();