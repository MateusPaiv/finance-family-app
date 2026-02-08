import type { AuthToken } from "./index.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthToken;
    }
  }
}

export {};
