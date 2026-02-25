const { Client } = require("@elastic/elasticsearch");

const client = new Client({
  node: "http://ecommerce_elasticsearch:9200"
});

// 🔍 SEARCH PRODUCTS
const searchProducts = async (req, res) => {
  try {
    const { q, page = 1, limit = 8 } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Search query required" });
    }

    const from = (page - 1) * parseInt(limit);

    let searchText = q;
    let minPrice = null;
    let maxPrice = null;

    const underMatch = q.match(/under\s+(\d+)/i);
    if (underMatch) {
      maxPrice = parseInt(underMatch[1]);
      searchText = searchText.replace(underMatch[0], "");
    }

    const aboveMatch = q.match(/above\s+(\d+)/i);
    if (aboveMatch) {
      minPrice = parseInt(aboveMatch[1]);
      searchText = searchText.replace(aboveMatch[0], "");
    }

    const betweenMatch = q.match(/between\s+(\d+)\s+and\s+(\d+)/i);
    if (betweenMatch) {
      minPrice = parseInt(betweenMatch[1]);
      maxPrice = parseInt(betweenMatch[2]);
      searchText = searchText.replace(betweenMatch[0], "");
    }

    searchText = searchText.trim();

    const result = await client.search({
      index: "products",
      from,
      size: parseInt(limit),
      query: {
        bool: {
          must: searchText
            ? [
                {
                  multi_match: {
                    query: searchText,
                    fields: ["proname^4", "description"],
                    fuzziness: "AUTO"
                  }
                }
              ]
            : [{ match_all: {} }],
          filter: [
            ...(minPrice !== null
              ? [{ range: { price: { gte: minPrice } } }]
              : []),
            ...(maxPrice !== null
              ? [{ range: { price: { lte: maxPrice } } }]
              : [])
          ]
        }
      }
    });

    const totalHits =
      typeof result.hits.total === "number"
        ? result.hits.total
        : result.hits.total?.value || 0;

    const hits = result.hits.hits.map(hit => ({
      id: hit._id,
      proname: hit._source.proname,
      description: hit._source.description,
      price: hit._source.price,
      image: hit._source.image,
      catid: hit._source.catid,
      score: hit._score
    }));

    res.json({
      total: totalHits,
      page: parseInt(page),
      totalPages: Math.ceil(totalHits / limit),
      products: hits
    });

  } catch (error) {
    console.error("Elasticsearch error:", error);
    res.status(500).json({ message: "Search failed" });
  }
};

// 🔄 SYNC MYSQL → ELASTIC
const syncProductsToElastic = async (req, res) => {
  try {
    const db = require("../config/db");

    const [products] = await db.query("SELECT * FROM products");

    // 🔥 Create index with proper mapping
    await client.indices.create(
      {
        index: "products",
        mappings: {
          properties: {
            proname: { type: "text" },
            description: { type: "text" },
            price: { type: "float" },   // VERY IMPORTANT
            catid: { type: "integer" }
          }
        }
      },
      { ignore: [400] }
    );

    const body = products.flatMap(product => [
      { index: { _index: "products", _id: product.proid } },
      {
        proname: product.proname,
        description: product.description,
        price: parseFloat(product.price),  // numeric
        image: product.image,
        catid: product.catid
      }
    ]);

    await client.bulk({ refresh: true, body });

    res.json({ message: "Products synced successfully!" });

  } catch (error) {
    console.error("Sync error:", error);
    res.status(500).json({ message: "Sync failed" });
  }
};

module.exports = {
  searchProducts,
  syncProductsToElastic
};