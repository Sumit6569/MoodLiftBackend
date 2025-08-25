import { DocumentClient } from "aws-sdk/clients/dynamodb";

export interface User {
  userId: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "user" | "listener";
  freeSessionsUsed: number;
  createdAt: string; // ISO 8601 timestamp
}

export class UserModel {
  private tableName = "Users";
  private docClient: DocumentClient;

  constructor(docClient: DocumentClient) {
    this.docClient = docClient;
  }

  async getAllUsers(): Promise<User[]> {
    const result = await this.docClient
      .scan({ TableName: this.tableName })
      .promise();
    return (result.Items as User[]) || [];
  }

  async createUser(user: User): Promise<User> {
    await this.docClient
      .put({
        TableName: this.tableName,
        Item: user,
      })
      .promise();
    return user;
  }

  async getUserById(userId: string): Promise<User | null> {
    const result = await this.docClient
      .get({
        TableName: this.tableName,
        Key: { userId },
      })
      .promise();
    return (result.Item as User) || null;
  }

  // Add more methods as needed (update, delete, etc.)
}
