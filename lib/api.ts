import { IConfig } from './shared/types'
import { MissingArgumentError } from './shared/errors'
import { Auth } from './auth/auth'

export class DescopeClient {
  Auth: Auth

  constructor(conf: IConfig) {
    if (!conf.projectId) {
      throw new MissingArgumentError('projectId')
    }
    this.Auth = new Auth(conf)
  }
}
