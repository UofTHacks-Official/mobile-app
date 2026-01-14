import { z } from "zod";

const envSchema = z
  .object({
    EXPO_PUBLIC_UOFT_STAGING: z.string().url().default(""),
    EXPO_PUBLIC_PUSH_ID: z.string().default(""),
    EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: z.string().default(""),
    EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: z.string().default(""),
    EXPO_PUBLIC_GOOGLE_REDIRECT_URI: z.string().url().default(""),
    EXPO_PUBLIC_CF_ACCOUNT_ID: z.string().default(""),
    EXPO_PUBLIC_R2_ACCESS_KEY_ID: z.string().default(""),
    EXPO_PUBLIC_R2_SECRET_ACCESS_KEY: z.string().default(""),
    EXPO_PUBLIC_R2_BUCKET_NAME: z.string().default(""),
  })
  .transform((data) => ({
    google: {
      webClientId: data.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: data.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      redirectUri: data.EXPO_PUBLIC_GOOGLE_REDIRECT_URI,
    },
    r2: {
      accountId: data.EXPO_PUBLIC_CF_ACCOUNT_ID,
      accessKeyId: data.EXPO_PUBLIC_R2_ACCESS_KEY_ID,
      secretAccessKey: data.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY,
      bucketName: data.EXPO_PUBLIC_R2_BUCKET_NAME,
    },
    pushId: data.EXPO_PUBLIC_PUSH_ID,
    uoftStaging: data.EXPO_PUBLIC_UOFT_STAGING,
  }));

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid environment variables: ${parsed.error.message}`);
}

export const env = parsed.data;
