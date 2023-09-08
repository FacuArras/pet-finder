import algoliasearch from "algoliasearch";

const client = algoliasearch(process.env.ALGOLIA_APPLICATION_KEY, process.env.ALGOLIA_WRITE_API_KEY);

const index = client.initIndex('pets');

console.log("gola");

export { index };