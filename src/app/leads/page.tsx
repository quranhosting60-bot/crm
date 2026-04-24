import { Client, Databases, ID } from "appwrite";

const client = new Client()
  .setEndpoint("https://sgp.cloud.appwrite.io/v1")
  .setProject("69d11dbd0038095220c4");

const db = new Databases(client);

const DATABASE_ID = "69d11e1f001579c962e6";
const COLLECTION_ID = "leads";

// ✅ GET (fetch leads)
export async function GET() {
  try {
    const res = await db.listDocuments(DATABASE_ID, COLLECTION_ID);
    return Response.json(res);
  } catch (err: any) {
    return Response.json({ error: err.message });
  }
}

// ✅ POST (create lead)
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const res = await db.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(),
      body
    );

    return Response.json(res);
  } catch (err: any) {
    return Response.json({ error: err.message });
  }
}

// ✅ PUT (update lead)
export async function PUT(req: Request) {
  try {
    const { id, data } = await req.json();

    const res = await db.updateDocument(
      DATABASE_ID,
      COLLECTION_ID,
      id,
      data
    );

    return Response.json(res);
  } catch (err: any) {
    return Response.json({ error: err.message });
  }
}

// ✅ DELETE (delete lead)
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    await db.deleteDocument(DATABASE_ID, COLLECTION_ID, id);

    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json({ error: err.message });
  }
}