import * as express from "express";
export declare function createNewSession(userId: string, from: "SIGN_UP" | "SIGN_IN", req: express.Request, res: express.Response): Promise<any>;
export declare function verifySession(req: express.Request, res: express.Response): Promise<string>;
export declare function revokeSession(userId: string, req: express.Request, res: express.Response): Promise<void>;
