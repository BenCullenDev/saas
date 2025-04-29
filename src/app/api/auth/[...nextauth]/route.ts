import NextAuth from "next-auth";
import { authOptions } from "./options";

// Create the handler
const handler = NextAuth(authOptions);

// Export the handler functions
export { handler as GET, handler as POST }; 