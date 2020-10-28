/* Copyright (c) 2020, VRAI Labs and/or its affiliates. All rights reserved.
 *
 * This software is licensed under the Apache License, Version 2.0 (the
 * "License") as published by the Apache Software Foundation.
 *
 * You may not use this file except in compliance with the License. You may
 * obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

import * as express from "express";
import Session from "../session";

export async function createNewSession(
    userId: string,
    from: "SIGN_UP" | "SIGN_IN",
    req: express.Request,
    res: express.Response
): Promise<any> {
    await Session.createNewSession(res, userId, {}, {});
}

export async function verifySession(req: express.Request, res: express.Response): Promise<string> {
    let session = await Session.getSession(req, res);
    return session.getUserId();
}

export async function revokeSession(userId: string, req: express.Request, res: express.Response) {
    let session = await Session.getSession(req, res);
    await session.revokeSession();
}
