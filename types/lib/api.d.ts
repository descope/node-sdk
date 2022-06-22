import { IConfig } from './shared/types';
import { Auth } from './auth/auth';
export declare class DescopeClient {
    Auth: Auth;
    constructor(conf: IConfig);
}
