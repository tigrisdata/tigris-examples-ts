import { NextApiRequest, NextApiResponse } from "next";
import { TodoItem } from "../../../db/models/todoItems";
import { SearchRequest } from "@tigrisdata/core/dist/search/types";
import tigrisDB from "../../../lib/tigris";

type Data = {
  result?: Array<TodoItem>;
  error?: string;
};

// GET /api/items/search?q=searchQ -- searches for items matching text `searchQ`
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const query = req.query["q"];
  if (query === undefined) {
    res.status(400).json({ error: "No search query found in request" });
    return;
  }
  try {
    const itemsCollection = tigrisDB.getCollection<TodoItem>(TodoItem);
    const searchRequest: SearchRequest<TodoItem> = { q: query as string };
    const searchResult = await itemsCollection.search(searchRequest);
    const items = new Array<TodoItem>();
    for (const hit of searchResult.hits) {
      items.push(hit.document);
    }
    res.status(200).json({ result: items });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
}
