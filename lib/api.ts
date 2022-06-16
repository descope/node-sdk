import { ProjectIdMissingError } from './errors';
import { Auth } from './auth/auth';
import { Config, setLogger, defaultLogger } from './shared';

export class DescopeClient {
  Auth: Auth;

  constructor(conf: Config) {
    if (!conf.projectId) {
      throw new ProjectIdMissingError();
    }

    if (conf.logger) {
      setLogger(conf.logger);
    } else {
      setLogger(new defaultLogger());
    }
    this.Auth = new Auth(conf);
  }
}
