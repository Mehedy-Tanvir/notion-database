// require("dotenv").config();
// const { Client } = require("@notionhq/client");
// const notion = new Client({ auth: process.env.NOTION_SECRET });

// const headers = {
//   Authorization: `Bearer ${process.env.NOTION_SECRET}`,
//   "Content-Type": "application/json",
//   "Notion-Version": "2021-08-16",
// };
// const query = "Form Fields Database Demo";
// if (!query) {
//   console.log("Please provide a query");
//   process.exit(1);
// }
// async function readAll() {
//   try {
//     const page = await fetch(
//       `https://api.notion.com/v1/databases/${process.env.DATABASE_ID}`,
//       {
//         method: "GET",
//         headers,
//       }
//     );
//     const data = await page.json();
//     return data;
//   } catch (error) {
//     console.error("Error:", error);
//   }
// }

// async function addData(doc) {
//   try {
//     const pageId = process.env.DATABASE_ID; // Database ID or parent page ID
//     const title = "Form Fields Pro"; // Title for the new database

//     // Create a new database with the Notion SDK
//     const newDb = await notion.databases.create({
//       parent: {
//         type: "page_id",
//         page_id: pageId,
//       },
//       title: [
//         {
//           type: "text",
//           text: {
//             content: title,
//           },
//         },
//       ],
//       properties: {
//         Name: {
//           title: {},
//         },
//         Description: {
//           rich_text: {},
//         },
//         Date: {
//           date: {},
//         },
//       },
//     });

//     // Return the newly created database object
//     return newDb;
//   } catch (error) {
//     console.error("Error creating database:", error);
//     throw error; // Rethrow error if necessary
//   }
// }

// async function updateData(doc, pageId) {
//   try {
//     const page = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
//       method: "PATCH",
//       headers,
//       body: JSON.stringify(doc),
//     });
//     const pageUpdated = await page.json();
//     return pageUpdated;
//   } catch (error) {
//     console.error("Error:", error);
//   }
// }

// async function deleteData(pageId) {
//   try {
//     const deletedData = await updateData({ archived: true }, pageId);
//     return deletedData;
//   } catch (error) {
//     console.log("Error: ", error);
//   }
// }

// (async () => {
//   //   const allData = await readAll();
//   //   console.log("all Data", allData);
//   let data = {
//     parent: { database_id: process.env.DATABASE_ID },
//     properties: {
//       Name: {
//         title: [
//           {
//             text: {
//               content: "new record",
//             },
//           },
//         ],
//       },
//     },
//   };
//   const page = await addData(data);
//   console.log("created Data", page);
//   data = {
//     parent: { database_id: process.env.DATABASE_ID },
//     properties: {
//       Name: {
//         title: [
//           {
//             content: "updated record",
//           },
//         ],
//       },
//     },
//   };
//   //   const updatedData = await updateData(data, page.id);
//   //   console.log("updated Data", updatedData);
//   //   const deletedData = await deleteData(page.id);
//   //   console.log("deleted data", deletedData);

//   //   const databases = await getDatabaseId();
//   //   console.log("databases", databases);
// })();

// async function getDatabaseId() {
//   const response = await notion.search({
//     query,
//     filter: { property: "object", value: "database" },
//   });
//   console.log(response.results);
// }

require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.json()); // To parse JSON bodies

// Notion SDK for JavaScript
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_SECRET });

// Serve static files
app.use(express.static("public"));

// Serve index page
app.get("/", function (request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

/**
 * Create: Add a new page to the database
 */
app.post("/databases", async function (request, response) {
  const pageId = process.env.NOTION_DATABASE_ID;
  const title = "Form Fields";

  try {
    const newDb = await notion.databases.create({
      parent: {
        type: "page_id",
        page_id: pageId,
      },
      title: [
        {
          type: "text",
          text: {
            content: title,
          },
        },
      ],
      properties: {
        Name: {
          title: {},
        },
      },
    });
    response.json({ message: "success!", data: newDb });
  } catch (error) {
    response.json({ message: "error", error });
  }
});

/**
 * Read: Get all pages from a database
 */
app.get("/pages", async function (request, response) {
  const databaseId = process.env.NOTION_DATABASE_ID;

  try {
    const pages = await notion.databases.query({
      database_id: databaseId,
    });
    response.json({ message: "success!", data: pages.results });
  } catch (error) {
    response.json({ message: "error", error });
  }
});

/**
 * Update: Update a specific page in the database
 */
app.patch("/pages/:pageId", async function (request, response) {
  const pageId = request.params.pageId;
  const newTitle = request.body.newTitle;

  try {
    const updatedPage = await notion.pages.update({
      page_id: pageId,
      properties: {
        Name: {
          title: [
            {
              text: {
                content: newTitle,
              },
            },
          ],
        },
      },
    });
    response.json({ message: "success!", data: updatedPage });
  } catch (error) {
    response.json({ message: "error", error });
  }
});

/**
 * Delete: Archive a page (soft delete)
 */
app.delete("/pages/:pageId", async function (request, response) {
  const pageId = request.params.pageId;

  try {
    const archivedPage = await notion.pages.update({
      page_id: pageId,
      archived: true,
    });
    response.json({
      message: "Page archived successfully!",
      data: archivedPage,
    });
  } catch (error) {
    response.json({ message: "error", error });
  }
});

app.post("/add-row", async function (request, response) {
  const databaseId = process.env.NOTION_DATABASE_ID;
  const { name, description, date } = request.body;

  try {
    // Create a new page (row) in the Notion database
    const newRow = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: name, // Name column
              },
            },
          ],
        },
        Description: {
          rich_text: [
            {
              text: {
                content: description, // Description column
              },
            },
          ],
        },
        Date: {
          date: {
            start: date, // Date column (ISO 8601 date format)
          },
        },
      },
    });

    response.json({ message: "Row added successfully!", data: newRow });
  } catch (error) {
    response.json({ message: "error", error });
  }
});

// Listen for requests
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
