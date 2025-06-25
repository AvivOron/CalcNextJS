import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "YOUR_GOOGLE_CLIENT_SECRET",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "YOUR_GITHUB_CLIENT_ID",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "YOUR_GITHUB_CLIENT_SECRET",
    }),
  ],
  events: {
    async signIn({ user }) {
      if (user?.email) {
        console.log(`User signed in: ${user.email}`);
      }
    },
  },
});

export { handler as GET, handler as POST }; 