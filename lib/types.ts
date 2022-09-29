interface Token {
  sub?: string
  exp?: number
  iss?: string
  [claim: string]: unknown
}

export interface AuthenticationInfo {
  jwt: string
  token: Token
  cookies?: string[]
}
