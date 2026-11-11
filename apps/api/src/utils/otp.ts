import crypto from "node:crypto";
import { OTP_LENGTH } from "./constants";

export function generateOTP(): string {
  const digits = "0123456789";

  let otp = "";

  for (let i = 0; i < OTP_LENGTH; i++) {
    const index = crypto.randomInt(0, digits.length);
    otp += digits[index];
  }

  return otp;
}