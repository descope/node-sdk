interface Token {
  sub?: string
  exp?: number
  iss?: string
}

export interface AuthenticationInfo {
  token?: Token
  cookies?: string[]
}

export interface ExchangeAccessKeyResult {
  token: Token
  sessionJwt: string
}
