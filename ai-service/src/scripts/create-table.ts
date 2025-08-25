import {
    CreateTableCommand,
    CreateTableCommandInput,
} from "@aws-sdk/client-dynamodb";
import { client } from "../config/dynamoClient";

const params: CreateTableCommandInput = {
    TableName: "Predictions",
    KeySchema: [
        { AttributeName: "id", KeyType: "HASH" },
        { AttributeName: "createdAt", KeyType: "RANGE" },
    ],
    AttributeDefinitions: [
        { AttributeName: "id", AttributeType: "S" },
        { AttributeName: "createdAt", AttributeType: "N" },
    ],
    BillingMode: "PAY_PER_REQUEST",
};

const run = async (): Promise<void> => {
    try {
        await client.send(new CreateTableCommand(params));
        console.log("Table 'Predictions' created successfully.");
    } catch (err) {
        if (err instanceof Error && err.name === "ResourceInUseException") {
            console.log("Table 'Predictions' already exists.");
        } else {
            console.error("Error creating table:", err);
        }
    }
};

run();
