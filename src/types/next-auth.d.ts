import "next-auth";

declare module "next-auth" {
    interface User {
        id?: string;
        role?: string;
        username?: string;
        personnelId?: string | null;
    }

    interface Session {
        user: {
            id?: string;
            role?: string;
            username?: string;
            personnelId?: string | null;
        } & import("next-auth").DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role?: string;
        username?: string;
        personnelId?: string | null;
    }
}
