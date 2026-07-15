/**
 * OTP Service
 * Handles OTP sending and verification through the backend API.
 * NEVER communicates directly with SMS-Gate.
 */

import { postJson } from './apiClient';

interface SendOtpResponse {
  success: boolean;
  data?: {
    success: boolean;
    message?: string;
  };
}

interface VerifyOtpResponse {
  success: boolean;
  data?: {
    success: boolean;
    message?: string;
  };
}

export const otpService = {
  /**
   * Request an OTP to be sent to a phone number
   */
  async sendOtp(phone: string): Promise<{ success: boolean; message?: string }> {
    const payload = await postJson<SendOtpResponse>('/send-otp', { phone });
    return {
      success: payload?.data?.success ?? false,
      message: payload?.data?.message,
    };
  },

  /**
   * Verify an OTP code
   */
  async verifyOtp(phone: string, otp: string): Promise<{ success: boolean; message?: string }> {
    const payload = await postJson<VerifyOtpResponse>('/verify-otp', { phone, otp });
    return {
      success: payload?.data?.success ?? false,
      message: payload?.data?.message,
    };
  },
};
