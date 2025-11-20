import type { JwtPayload } from "jsonwebtoken";

export interface UserPayload{
    user_id:string
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload; 
    }
  }
}
