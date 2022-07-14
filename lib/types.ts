interface Token {
  sub?: string
  exp?: number
  iss?: string
}

export interface AuthenticationInfo {
  token?: Token
  cookies?: string[]
}
