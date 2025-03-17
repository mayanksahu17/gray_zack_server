

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            ACCESS_TOKEN: string;
            ACCES_EXPIRY_TOKEN: string;
            REFRESH_TOKEN_SECRET: string;
            REFRESH_TOKEN_EXPIRY: string;
        }
    }
}

export {};