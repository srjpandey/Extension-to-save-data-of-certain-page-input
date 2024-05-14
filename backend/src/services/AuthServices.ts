import jwt from "jsonwebtoken";
class AuthServiceClass {
  async genereateToken(email: string) {
    var token = jwt.sign({ email }, "", {
      expiresIn: "7d",
    });
    return token;
  }
  async decodeToken(token: string) {
    console.log("decodings");

    try {
      const res = jwt.verify(token, "") as jwt.JwtPayload & {
        email: string;
      };
      console.log("res", res);

      return res?.email;
    } catch (error) {
      console.log(error);
    }
  }
}
export const AuthService = new AuthServiceClass();
