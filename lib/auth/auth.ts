import {
  fetchConfig,
  request,
  DeliveryMethod,
  User,
  httpResponse,
} from "./../shared.js";
import { OTP } from "./otp.js";
import * as jose from "jose";

interface VerifyCodeRequest extends SignInRequest {
  code: string;
}

interface Token {
  sub?: string;
  exp?: number;
  iss?: string;
}
interface SignInRequest {
  method: DeliveryMethod;
  identifier: string;
}
interface SignUpRequest extends SignInRequest {
  user: User;
}

export class Auth {
  private fetchConfig: fetchConfig;
  otp: OTP;
  keys: Record<string, jose.KeyLike | Uint8Array> = {};

  constructor(conf: fetchConfig) {
    this.fetchConfig = { ...new fetchConfig(), ...conf };
    this.otp = new OTP(this.fetchConfig);
  }

  async SignInOTP(r: SignInRequest): Promise<httpResponse<void>> {
    return await this.otp.signIn(r.method, r.identifier);
  }
  async SignUpOTP(r: SignUpRequest): Promise<httpResponse<void>> {
    return await this.otp.signUp(r.method, r.identifier, r.user);
  }
  async VerifyCode(r: VerifyCodeRequest): Promise<Token | undefined> {
    const res = await request<Token>(this.fetchConfig, {
      method: "POST",
      url: `auth/code/verify/${r.method}`,
      data: { [r.method]: r.identifier, code: r.code },
    });
    return res.body;
  }

  async ValidateSession(
    sessionToken: string,
    refreshToken: string
  ): Promise<Token | null> {
    if (sessionToken === "") throw Error("empty session token");
    try {
      const res = await jose.jwtVerify(sessionToken, this.getKey, {
        algorithms: ["ES384"],
      });
      return { ...res.payload };
    } catch (error) {
      const res = await jose.jwtVerify(refreshToken, this.getKey, {
        algorithms: ["ES384"],
      });
      if (res) {
        console.log("request refresh token", res);
      }
    }
    return null;
  }

  getKey: jose.JWTVerifyGetKey = async (
    header: jose.JWTHeaderParameters
  ): Promise<jose.KeyLike | Uint8Array> => {
    const currentKid = header?.kid || "";
    if (!this.keys[currentKid]) {
      const publicKeys = await request(
        { ...this.fetchConfig, baseURL: "http://localhost:8152/v1/" },
        {
          method: "GET",
          url: `keys/${this.fetchConfig.projectId}`,
        }
      );

      (publicKeys.body as jose.JWK[]).forEach(async (key) => {
        this.keys[key?.kid || ""] = await jose.importJWK(key);
      });
    }

    if (this.keys[currentKid]) {
      return this.keys[currentKid];
    }
    throw Error("failed to fetch matching key");
  };
}
