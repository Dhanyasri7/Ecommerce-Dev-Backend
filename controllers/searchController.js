const client = require("../config/elastic");

exports.searchProducts = async (req, res) => {
  try {
    const { q, page = 1, limit = 8 } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Search query required" });
    }

    const from = (page - 1) * parseInt(limit);

    let searchText = q;
    let maxPrice = null;
    let minPrice = null;

    // 🔹 Detect "between 20000 and 50000"
    const betweenMatch = q.match(/between\s+(\d+)\s+and\s+(\d+)/i);
    if (betweenMatch) {
      minPrice = parseInt(betweenMatch[1]);
      maxPrice = parseInt(betweenMatch[2]);
      searchText = q.replace(betweenMatch[0], "").trim();
    }

    // 🔹 Detect "under 50000"
    const underMatch = q.match(/under\s+(\d+)/i);
    if (underMatch) {
      maxPrice = parseInt(underMatch[1]);
      searchText = q.replace(underMatch[0], "").trim();
    }

    // 🔹 Detect "above 30000"
    const aboveMatch = q.match(/above\s+(\d+)/i);
    if (aboveMatch) {
      minPrice = parseInt(aboveMatch[1]);
      searchText = q.replace(aboveMatch[0], "").trim();
    }

    const result = await client.search({
      index: "products",
      from: from,
      size: parseInt(limit),
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query: searchText,
                fields: ["proname^4", "description"],
                fuzziness: 2,                 // strong typo tolerance
                operator: "or",               // less strict matching
                minimum_should_match: "75%"   // flexible matching
              }
            }
          ],
          should: [
            {
              match_phrase_prefix: {
                proname: {
                  query: searchText,
                  boost: 5
                }
              }
            }
          ],
          filter: [
            ...(maxPrice
              ? [{ range: { price: { lte: maxPrice } } }]
              : []),
            ...(minPrice
              ? [{ range: { price: { gte: minPrice } } }]
              : [])
          ]
        }
      },
      highlight: {
        fields: {
          proname: {},
          description: {}
        }
      }
    });

    const hits = result.hits.hits.map(hit => ({
      id: hit._id,
      score: hit._score,
      proname: hit.highlight?.proname
        ? hit.highlight.proname[0]
        : hit._source.proname,
      description: hit.highlight?.description
        ? hit.highlight.description[0]
        : hit._source.description,
      price: hit._source.price,
      image: hit._source.image,
      catid: hit._source.catid
    }));

    res.json({
      total: result.hits.total.value,
      page: parseInt(page),
      totalPages: Math.ceil(result.hits.total.value / limit),
      products: hits,
    });

  } catch (error) {
    console.error("Elasticsearch error:", error);
    res.status(500).json({ message: "Search failed" });
  }
};