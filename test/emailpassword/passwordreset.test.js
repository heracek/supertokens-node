/* Copyright (c) 2021, VRAI Labs and/or its affiliates. All rights reserved.
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

const { printPath, setupST, startST, killAllST, cleanST, signUPRequest } = require("../utils");
let STExpress = require("../../");
let Session = require("../../recipe/session");
let assert = require("assert");
let { ProcessState } = require("../../lib/build/processState");
let EmailPassword = require("../../recipe/emailpassword");
const express = require("express");
const request = require("supertest");

/**
 * TODO: (later) in passwordResetFunctions.ts:
 *        - (later) check that getResetPasswordURL works fine
 *        - (later) check that createAndSendCustomEmail works fine
 * TODO: generate token API:
 *        - (later) Call the createResetPasswordToken function with valid input
 *        - (later) Call the createResetPasswordToken with unknown userId and test error thrown
 * TODO: password reset API:
 *        - (later) Call the resetPasswordUsingToken function with valid input
 *        - (later) Call the resetPasswordUsingToken with an invalid token and see the error
 *        - (later) token is not of type string from input
 */

describe(`passwordreset: ${printPath("[test/emailpassword/passwordreset.test.js]")}`, function () {
    let token = "";
    let resetURL = "";
    let tokenInfo = "";
    let ridInfo = "";
    let app, userInfo;

    before(async function () {
        await killAllST();
        await setupST();
        await startST();
        STExpress.init({
            supertokens: {
                connectionURI: "http://localhost:8080",
            },
            appInfo: {
                apiDomain: "api.supertokens.io",
                appName: "SuperTokens",
                websiteDomain: "supertokens.io",
            },
            recipeList: [
                EmailPassword.init({
                    resetPasswordUsingTokenFeature: {
                        createAndSendCustomEmail: (user, passwordResetURLWithToken) => {
                            token = passwordResetURLWithToken.split("?")[1].split("&")[0].split("=")[1];
                            resetURL = passwordResetURLWithToken.split("?")[0];
                            tokenInfo = passwordResetURLWithToken.split("?")[1].split("&")[0];
                            ridInfo = passwordResetURLWithToken.split("?")[1].split("&")[1];
                        },
                    },
                }),
                Session.init(),
            ],
        });

        app = express();

        app.use(STExpress.middleware());

        app.use(STExpress.errorHandler());

        const signUPResponse = await signUPRequest(app, "random@gmail.com", "validpass123");
        assert(JSON.parse(signUPResponse.text).status === "OK");
        assert(signUPResponse.status === 200);

        userInfo = JSON.parse(signUPResponse.text).user;
    });

    beforeEach(async function () {
        ProcessState.getInstance().reset();
    });

    afterEach(async function () {
        token = "";
        resetURL = "";
        tokenInfo = "";
        ridInfo = "";
    });

    after(async function () {
        await killAllST();
        await cleanST();
    });

    /*
     * generate token API:
     *      - email validation checks
     *      - non existent email should return "OK" with a pause > 300MS
     *      - check that the generated password reset link is correct
     */
    it("test email validation checks in generate token API", async function () {
        const passwordResetTokenAPIResponse = await new Promise((resolve) =>
            request(app)
                .post("/auth/user/password/reset/token")
                .send({
                    formFields: [
                        {
                            id: "email",
                            value: "random",
                        },
                    ],
                })
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        resolve(undefined);
                    } else {
                        resolve(res);
                    }
                })
        );
        assert(passwordResetTokenAPIResponse.body.status === "FIELD_ERROR");
        assert(passwordResetTokenAPIResponse.body.formFields.length === 1);
        assert(passwordResetTokenAPIResponse.body.formFields[0].error === "Email is invalid");
        assert(passwordResetTokenAPIResponse.body.formFields[0].id === "email");
    });

    it("test that generated password link is correct", async function () {
        await new Promise((resolve) =>
            request(app)
                .post("/auth/user/password/reset/token")
                .send({
                    formFields: [
                        {
                            id: "email",
                            value: "random@gmail.com",
                        },
                    ],
                })
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        resolve(undefined);
                    } else {
                        resolve(res);
                    }
                })
        );
        assert(resetURL === "https://supertokens.io/auth/reset-password");
        assert(tokenInfo.startsWith("token="));
        assert(ridInfo.startsWith("rid=emailpassword"));
    });

    /*
     * password reset API:
     *        - password validation checks
     *        - token is missing from input
     *        - invalid token in input
     *        - input is valid, check that password has changed (call sign in)
     */
    it("test password validation", async function () {
        let newPasswordAPIResponse = await new Promise((resolve) =>
            request(app)
                .post("/auth/user/password/reset")
                .send({
                    formFields: [
                        {
                            id: "password",
                            value: "invalid",
                        },
                    ],
                    token: "randomToken",
                })
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        resolve(undefined);
                    } else {
                        resolve(JSON.parse(res.text));
                    }
                })
        );
        assert(newPasswordAPIResponse.status === "FIELD_ERROR");
        assert(
            newPasswordAPIResponse.formFields[0].error ===
                "Password must contain at least 8 characters, including a number"
        );
        assert(newPasswordAPIResponse.formFields[0].id === "password");

        newPasswordAPIResponse = await new Promise((resolve) =>
            request(app)
                .post("/auth/user/password/reset")
                .send({
                    formFields: [
                        {
                            id: "password",
                            value: "validpass123",
                        },
                    ],
                    token: "randomToken",
                })
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        resolve(undefined);
                    } else {
                        resolve(JSON.parse(res.text));
                    }
                })
        );
        assert(newPasswordAPIResponse.status !== "FIELD_ERROR");
    });

    it("test token missing from input", async function () {
        const newPasswordAPIResponse = await new Promise((resolve) =>
            request(app)
                .post("/auth/user/password/reset")
                .send({
                    formFields: [
                        {
                            id: "password",
                            value: "validpass123",
                        },
                    ],
                })
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        resolve(undefined);
                    } else {
                        resolve(JSON.parse(res.text));
                    }
                })
        );
        assert(newPasswordAPIResponse.message === "Please provide the password reset token");
    });

    it("test invalid token input", async function () {
        const newPasswordAPIResponse = await new Promise((resolve) =>
            request(app)
                .post("/auth/user/password/reset")
                .send({
                    formFields: [
                        {
                            id: "password",
                            value: "validpass123",
                        },
                    ],
                    token: "invalidToken",
                })
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        resolve(undefined);
                    } else {
                        resolve(JSON.parse(res.text));
                    }
                })
        );
        assert(newPasswordAPIResponse.status === "RESET_PASSWORD_INVALID_TOKEN_ERROR");
    });

    it("test valid token input and passoword has changed", async function () {
        await new Promise((resolve) =>
            request(app)
                .post("/auth/user/password/reset/token")
                .send({
                    formFields: [
                        {
                            id: "email",
                            value: "random@gmail.com",
                        },
                    ],
                })
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        resolve(undefined);
                    } else {
                        resolve(res);
                    }
                })
        );

        await new Promise((resolve) =>
            request(app)
                .post("/auth/user/password/reset")
                .send({
                    formFields: [
                        {
                            id: "password",
                            value: "validpass12345",
                        },
                    ],
                    token,
                })
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        resolve(undefined);
                    } else {
                        resolve(JSON.parse(res.text));
                    }
                })
        );

        let failureResponse = await new Promise((resolve) =>
            request(app)
                .post("/auth/signin")
                .send({
                    formFields: [
                        {
                            id: "password",
                            value: "validpass123",
                        },
                        {
                            id: "email",
                            value: "random@gmail.com",
                        },
                    ],
                })
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        resolve(undefined);
                    } else {
                        resolve(JSON.parse(res.text));
                    }
                })
        );
        assert(failureResponse.status === "WRONG_CREDENTIALS_ERROR");

        let successResponse = await new Promise((resolve) =>
            request(app)
                .post("/auth/signin")
                .send({
                    formFields: [
                        {
                            id: "password",
                            value: "validpass12345",
                        },
                        {
                            id: "email",
                            value: "random@gmail.com",
                        },
                    ],
                })
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        resolve(undefined);
                    } else {
                        resolve(JSON.parse(res.text));
                    }
                })
        );
        assert(successResponse.status === "OK");
        assert(successResponse.user.id === userInfo.id);
        assert(successResponse.user.email === userInfo.email);
    });
});
