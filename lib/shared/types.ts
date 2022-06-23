import { ILogger, DefaultLogger } from './logger'

export enum HTTPMethods {
  get = 'GET',
  delete = 'DELETE',
  post = 'POST',
  put = 'PUT',
}

export interface Token {
  sub?: string
  exp?: number
  iss?: string
}

export interface IRequestConfig {
  baseURL?: string
  headers?: Record<string, string>
  timeoutSeconds?: number
  projectId: string
  publicKey?: string
}

export interface IConfig extends IRequestConfig {
  logger?: ILogger
}

export enum DeliveryMethod {
  email = 'email',
  SMS = 'sms',
  whatsapp = 'whatsapp',
}

export interface User {
  username: string
  name?: string
  email?: string
  phone?: string
}

export const HTTPStatusCode = {
  ok: 200,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  internalServerError: 500,
}

export enum OAuthProvider {
  facebook = 'facebook',
  github = 'github',
  google = 'google',
  microsoft = 'microsoft',
  gitlab = 'gitlab',
  apple = 'apple',
}

export class Config implements IConfig {
  baseURL?: string

  headers?: Record<string, string>

  timeoutSeconds?: number

  projectId!: string

  publicKey?: string

  constructor() {
    this.baseURL = 'https://descope.com/v1/'
    this.headers = {}
    this.timeoutSeconds = 60
    this.logger = new DefaultLogger()
  }

  logger: ILogger
}
