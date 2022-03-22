import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";


export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    // GithubProvider({
    //   clientId: process.env.GITHUB_ID,
    //   clientSecret: process.env.GITHUB_SECRET,
    // }),
    CredentialsProvider({
      id: "myCredentials",
      name: "Next Auth Credentials",
      type: "credentials",
      // credentials: {
      //   walletId: { label: "walletId", type: "text", placeholder: "jsmith" },
      // },
      async authorize(credentials, req) {
        // console.log('credentials', credentials);
        if (credentials.walletId.toUpperCase() === credentials.recoveredAddress.toUpperCase()) {
          return {
            id: credentials.walletId,
            name: 'john smith',
            age: 12
          }
        }
      },
    }),
  ],
  session: {
    jwt: true,
    maxAge: 10 * 60 * 60, // 10 hours
  },
  secret: process.env.NEXT_PUBLIC_NEXT_AUTH_SECRET,
  jwt: {
    signingKey: process.env.JWT_SIGNING_PRIVATE_KEY
  },
  callbacks: {
    // async signIn({ user, account, profile, email, credentials }) {
    //   return true
    // },
    // async redirect({ url, baseUrl }) {
    //   // return baseUrl
    // },
    async jwt({ token, user, account, profile, isNewUser }) {
      if (user) {
        token.id = user.id;
        token.age = user.age;
      }
      return token
    },
    async session({ session, user, token }) {
      session.user.id = token.id;
      session.user.age = token.age;
      return session
    }
  },
  // pages: {
  //   // signIn: '/auth/signin',
  //   // signOut: '/auth/signout',
  //   // error: '/auth/error', // Error code passed in query string as ?error=
  //   // verifyRequest: '/auth/verify-request', // (used for check email message)
  //   // newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
  // },
  // adapter: DynamoDBAdapter(client),
  debug: process.env.NODE_ENV === 'development'
})