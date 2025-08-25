import { Router, Request, Response } from "express";
import { PutCommand, ScanCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { docClient } from "../config/dynamoClient";

const router = Router();

router.post("/predict", async (req: Request, res: Response) => {
    const { body } = req;
    const predictionId = uuidv4();
    const createdAt = Date.now();

    const predictionResult = { message: "AI prediction result", input: body };

    const params = {
        TableName: "Predictions",
        Item: {
            id: predictionId,
            createdAt: createdAt,
            input: body,
            result: predictionResult,
        },
    };

    try {
        await docClient.send(new PutCommand(params));
        res.status(201).json({
            message: "Prediction saved successfully",
            predictionId,
            data: predictionResult,
        });
    } catch (err) {
        console.error("Error saving prediction to DynamoDB", err);
        res.status(500).json({ message: "Error saving prediction" });
    }
});

router.get("/predict", async (req: Request, res: Response) => {
    const params = {
        TableName: "Predictions",
    };

    try {
        const data = await docClient.send(new ScanCommand(params));
        res.status(200).json(data.Items);
    } catch (err) {
        console.error("Error fetching predictions from DynamoDB", err);
        res.status(500).json({ message: "Error fetching predictions" });
    }
});

router.get("/predict/:id", async (req: Request, res: Response) => {
    const { id } = req.params;

    const params = {
        TableName: "Predictions",
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: {
            ":id": id,
        },
    };

    try {
        const data = await docClient.send(new QueryCommand(params));
        if (data.Items && data.Items.length > 0) {
            res.status(200).json(data.Items);
        } else {
            res.status(404).json({ message: "Prediction not found" });
        }
    } catch (err) {
        console.error("Error fetching prediction from DynamoDB", err);
        res.status(500).json({ message: "Error fetching prediction" });
    }
});

export default router;
