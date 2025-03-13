// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "projectmanagementdemmoapp",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    new sst.aws.Nextjs("site",{
      environment: {
        DATABASE_URL: process.env.DATABASE_URL || "",
        AUTH_SECRET: process.env.AUTH_SECRET || "",
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "",
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || "",
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      },
    });
  },
});
