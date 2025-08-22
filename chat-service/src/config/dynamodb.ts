import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
  region: "local",
  endpoint: "http://localhost:8000", // DynamoDB Local
});

export default client;