export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// TODO: Add your type definitions here
// Example:
// export interface User {
//   id: number;
//   email: string;
//   firstName: string;
//   lastName: string;
//   createdAt: Date;
//   updatedAt: Date;
// }

// export interface JwtPayload {
//   userId: number;
//   email: string;
//   iat?: number;
//   exp?: number;
// }