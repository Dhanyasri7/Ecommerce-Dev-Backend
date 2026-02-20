const client = require("../config/elastic");

exports.searchProducts = async (req, res) => {
  try {
    const { q, page = 1, limit = 8 } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Search query required" });
    }

    const from = (page - 1) * limit;

    const result = await client.search({
  index: "products",
  from: from,
  size: parseInt(limit),
  query: {
    bool: {
      should: [
        {
          multi_match: {
            query: q,
            fields: ["proname^4", "description"],
            fuzziness: "AUTO",
            operator: "and"
          }
        },
        {
          match_phrase_prefix: {
            proname: {
              query: q,
              boost: 5
            }
          }
        }
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
    console.error(error);
    res.status(500).json({ message: "Search failed" });
  }
};
