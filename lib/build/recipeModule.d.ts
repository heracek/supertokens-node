import { Querier } from "./querier";
import STError from "./error";
import { NormalisedAppinfo, APIHandled, HTTPMethod } from "./types";
import * as express from "express";
import NormalisedURLPath from "./normalisedURLPath";
export default abstract class RecipeModule {
    private recipeId;
    private querier;
    private appInfo;
    constructor(recipeId: string, appInfo: NormalisedAppinfo);
    getRecipeId: () => string;
    getAppInfo: () => NormalisedAppinfo;
    getQuerier: () => Querier;
    isErrorFromThisRecipe: (err: any) => err is STError;
    returnAPIIdIfCanHandleRequest: (path: NormalisedURLPath, method: HTTPMethod) => string | undefined;
    abstract getAPIsHandled(): APIHandled[];
    abstract handleAPIRequest(id: string, req: express.Request, response: express.Response, next: express.NextFunction): Promise<void>;
    abstract handleError(error: STError, request: express.Request, response: express.Response, next: express.NextFunction): void;
    abstract getAllCORSHeaders(): string[];
}
