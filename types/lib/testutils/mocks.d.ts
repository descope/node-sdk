export declare class Mock {
    projectID: string;
    JWT: {
        new (): {};
        valid: string;
        expired: string;
    };
    PublicKeys: {
        new (): {};
        valid: {
            crv: string;
            d: string;
            key_ops: string[];
            kty: string;
            x: string;
            y: string;
            alg: string;
            use: string;
            kid: string;
        };
    };
}
export declare const GetMocks: () => Mock;
