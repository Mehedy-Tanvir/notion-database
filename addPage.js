const { Client } = require("@notionhq/client");
const { config } = require("dotenv");
const { propertiesForNewPages } = require("./sampleData"); // Adjust import if needed

config();

const pageId = process.env.NOTION_PAGE_ID;
const apiKey = process.env.NOTION_API_KEY;

const notion = new Client({ auth: apiKey });

async function addNotionPageToDatabase(databaseId, pageProperties) {
  const newPage = await notion.pages.create({
    parent: {
      database_id: databaseId,
    },
    properties: pageProperties,
  });
  console.log(newPage);
}

async function main() {
  const newDatabase = await notion.databases.create({
    parent: {
      type: "page_id",
      page_id: pageId,
    },
    title: [
      {
        type: "text",
        text: {
          content: "Grocery list",
        },
      },
    ],
    properties: {
      "Grocery item": {
        type: "title",
        title: {},
      },
      Price: {
        type: "number",
        number: {
          format: "dollar",
        },
      },
      "Last ordered": {
        type: "date",
        date: {},
      },
    },
  });

  console.log(newDatabase.url);

  const databaseId = newDatabase.id;
  if (!databaseId) return;

  console.log("Adding new pages...");
  for (let i = 0; i < propertiesForNewPages.length; i++) {
    await addNotionPageToDatabase(databaseId, propertiesForNewPages[i]);
  }
}

main();
