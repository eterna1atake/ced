import { cookies } from "next/headers";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
    const cookieStore = await cookies();
    const trustedDevice = cookieStore.get("ced_trusted_device");
    const isTrustedDevice = !!trustedDevice;

    return <LoginForm isTrustedDevice={isTrustedDevice} />;
}
