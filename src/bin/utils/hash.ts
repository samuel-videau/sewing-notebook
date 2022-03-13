import * as crypto from "crypto";

export function hashString(str: string) {
  return crypto.createHash('sha256').update(str).digest('base64');
}
