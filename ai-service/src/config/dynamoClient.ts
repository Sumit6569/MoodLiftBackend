import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import dotenv from "dotenv";

dotenv.config();

const DYNAMODB_ENDPOINT = process.env["DYNAMODB_ENDPOINT"];
const AWS_REGION = process.env["AWS_REGION"];
const AWS_ACCESS_KEY_ID = process.env["AWS_ACCESS_KEY_ID"];
const AWS_SECRET_ACCESS_KEY = process.env["AWS_SECRET_ACCESS_KEY"];

// When running against local DynamoDB, prefer using DYNAMODB_ENDPOINT and do not require AWS creds
const usingLocalDynamo = Boolean(DYNAMODB_ENDPOINT);

if (
  !usingLocalDynamo &&
  (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY)
) {
  throw new Error(
    "Missing AWS environment variables. Please check your .env file."
  );
}

const client = new DynamoDBClient(
  usingLocalDynamo
    ? {
        region: AWS_REGION || "local",
        endpoint: DYNAMODB_ENDPOINT,
        credentials: {
          accessKeyId: AWS_ACCESS_KEY_ID || "local",
          secretAccessKey: AWS_SECRET_ACCESS_KEY || "local",
        },
      }
    : {
        region: AWS_REGION as string,
        credentials: {
          accessKeyId: AWS_ACCESS_KEY_ID as string,
          secretAccessKey: AWS_SECRET_ACCESS_KEY as string,
        },
      }
);

const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: true,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
});

export { docClient, client };
