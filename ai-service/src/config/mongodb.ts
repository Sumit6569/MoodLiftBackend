// import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

// const client = new DynamoDBClient({
//   region: "local",
//   endpoint: "http://localhost:8000", // DynamoDB Local
// });

// export default client;


import { MongoClient, Db } from "mongodb";

let db: Db;

export const connectDB = async (): Promise<Db> => {
  if (db) return db;

  const uri = process.env['MONGO_URI'] || "mongodb://localhost:27017";
  const client = new MongoClient(uri);

  await client.connect();

  // The DB name comes from the URI (e.g. ai-service, user-service)
  db = client.db();
  console.log(`✅ MongoDB connected to ${db.databaseName}`);

  return db;
};
