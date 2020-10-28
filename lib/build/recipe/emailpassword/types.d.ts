import * as express from 'express';
export declare type TypeInput = {
    signUpFeature?: TypeInputSignUp;
    signInFeature?: TypeInputSignIn;
    resetPasswordUsingTokenFeature?: TypeInputResetPasswordUsingTokenFeature;
    sessionInterface?: TypeInputSessionInterface;
};
export declare type TypeNormalisedInput = {
    signUpFeature: TypeNormalisedInputSignUp;
    signInFeature: TypeNormalisedInputSignIn;
    resetPasswordUsingTokenFeature: TypeNormalisedInputResetPasswordUsingTokenFeature;
    sessionInterface: TypeNormalisedInputSessionInterface;
};
export declare type TypeInputSignUp = {
    disableDefaultImplementation?: boolean;
    formFields?: {
        id: string;
        validate?: (value: string) => Promise<string | undefined>;
        optional?: boolean;
    }[];
    handleCustomFormFields?: (user: User, formFields: {
        id: string;
        value: string;
    }[]) => Promise<void>;
};
export declare type TypeInputSignIn = {
    disableDefaultImplementation?: boolean;
};
export declare type TypeNormalisedInputSignUp = {
    disableDefaultImplementation: boolean;
    formFields: {
        id: string;
        validate: (value: string) => Promise<string | undefined>;
        optional: boolean;
    }[];
    handleCustomFormFields: (user: User, formFields: {
        id: string;
        value: string;
    }[]) => Promise<void>;
};
export declare type TypeNormalisedInputSignIn = {
    disableDefaultImplementation: boolean;
    formFields: {
        id: "email" | "password";
        validate: (value: string) => Promise<string | undefined>;
    }[];
};
export declare type TypeInputResetPasswordUsingTokenFeature = {
    disableDefaultImplementation?: boolean;
    getResetPasswordURL?: (user: User) => Promise<string>;
    createAndSendCustomEmail?: (user: User, passwordResetURLWithToken: string) => Promise<void>;
};
export declare type TypeNormalisedInputResetPasswordUsingTokenFeature = {
    disableDefaultImplementation: boolean;
    getResetPasswordURL: (user: User) => Promise<string>;
    createAndSendCustomEmail: (user: User, passwordResetURLWithToken: string) => Promise<void>;
    formFields: {
        id: "password";
        validate: (value: string) => Promise<string | undefined>;
    }[];
};
export declare type TypeInputSessionInterface = {
    createNewSession?: (userId: string, from: "SIGN_UP" | "SIGN_IN", req: express.Request, res: express.Response) => Promise<any>;
    verifySession?: (req: express.Request, res: express.Response) => Promise<string>;
    revokeSession?: (userId: string, req: express.Request, res: express.Response) => void;
};
export declare type TypeNormalisedInputSessionInterface = {
    createNewSession: (userId: string, from: "SIGN_UP" | "SIGN_IN", req: express.Request, res: express.Response) => Promise<any>;
    verifySession: (req: express.Request, res: express.Response) => Promise<string>;
    revokeSession: (userId: string, req: express.Request, res: express.Response) => void;
};
export declare type User = {
    id: string;
    email: string;
};
