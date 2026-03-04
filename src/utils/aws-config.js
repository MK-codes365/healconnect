import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";

const region = import.meta.env.VITE_AWS_REGION || "us-east-1";

export const bedrockClient = new BedrockRuntimeClient({
  region,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});

export const BEDROCK_MODEL_ID = import.meta.env.VITE_BEDROCK_MODEL_ID || "anthropic.claude-3-haiku-20240307-v1:0";
