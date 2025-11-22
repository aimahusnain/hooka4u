import "next-auth";

declare module "next-auth" {
  interface User {
    username?: string;
  }
  
  interface Session {
    user: {
      username?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username?: string;
  }
}