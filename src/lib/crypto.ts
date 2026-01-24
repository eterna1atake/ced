import { compactDecrypt, CompactEncrypt, importPKCS8, importSPKI } from "jose";

// Default Development Keys (Generated for testing only - DO NOT USE IN PRODUCTION)
// These allow the app to run immediately without manual setup in dev.
const DEV_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC8gauSUWQQUQqA
V4B6uIQzXeM63dOQlplTi2OmhLsLOlDJCxg7gmsbCMCT4mC3MPJPu/yqC4NqDCjd
83CHx3P+Se0BE93e3dx1Y84Fkuu6DLzMqmbi8FkQi7eZm5/lWG6jyvv+IFJvA97w
YH63EBuqPrZgmpV6mWZP8q3GNCJiKPbNJRs4O0RX/HqOvwxw6+9kwt9se3VRorQZ
/c9iYuXnTjA4n38tWkjNiUXOXm9HL0DsZM8zBk5CkRIVvDkZgzf5ogygEwer3POB
bm++TYPnBC44LNe1rYoEOPBetDeKll/hvwufUnnbZAkfL4a/btWEkOX7guQ1cl5B
YzytGLXNAgMBAAECggEAArbfdxV9ww0cxxkkLvd4NU+BpZ8fc4g4V29OhrZZYpjd
9b8jMlNxeaXz15MdmAoPQPsfNvH6fvK9mkTt4mL+/C0SD4rdvJjC98TaLru6WsRW
GIlDbV3Dni/3ByZwBalb0nz15pXrYTmT6F50yndjxpczOEWF7ZXeKGsBYsC+bXTv
m488aTkiuhJHIM0O6wCh+rFGl2XOllRdRFE4ur4WrHwMFmn2tVagmXKjr3mw7WYE
sLaK4j9RrpLqf1vNg8kSVSO1dpnYlS0222QXkZtkgX+lHUNbAhN8AfQXvBIy9GWk
n95Nmg1unl79t7aTojsz8upOuwtJ0gOez3Q0cxNF+wKBgQD+RJ0YHkq/VjQJpgOz
WZbeiKihFrqVhZDqka7aJOmejbD/2b13PJtv/tvDNEROeD8TI+ZbtqjkgrEFXYCH
wWn/dqk9u/kRPTo8zBfDHD+vQFlcZ9sH8pVjzKet/G3lrxos5UWloWLVqxcTpayk
Vs9HUfNwQIwqS9frxgQv+x81wwKBgQC9ymIdfO5TbiUXCHhYOU1gWsghLMTJg+w2
uMvbPoJzbNoPFoYuv/XF2/FOScaQYL15oP8yDcnuXASzwJkrhL/mvPCtz0oW2ycJ
8yRgI+uYKTKDovzEMI6WtAg2g6Kb4LlRMZDPdaWStSj3QavmtwR+9jX6JFAmKBmA
jk6p2XJdLwKBgQCYXLch56z0wIwIKBHZm9qa2JrrhHoj9Nhkpw12rF3NY6xnc6tj
0s51qus3Ko+v0cBCEOYNmQPVgjbfNys4rf59VTaOxp+149GM8uNeSAQlWNLzW0xV
k9hO6CimSjf0RRvTQUOdv3pA/PekD0fHZjlozEOqxRL4mV/2aT7DHaCTDwKBgQCf
wEauA4an+0KFDMAforwaqs9h/Uj3RnAB77LILOmpNqqloJP5reK2VNfcygS1aniS
dI3aF/ktBY9/rlI/a1IMamU8KAt5CabmnR61PgcE4Uh/vSV+DlE3UPrIyCyLgLD8
QvhdZ+2ie5Kr7T9AyDSkmaH9l6tPMtmkeCSGm13ESQKBgFW4ujCQnvDO7IvPkY8B
mCzTjqpV3K0W+NyESlIGCgAn1b2k0qfDh7SzDgGhTN8g1kVrsngNI3LMZhhIN1VS
Ji+TV9Wi5ibl2ZTm+ocb/PrpWChIC81IN37+fv0cpTU4KF/ht81B8wQUt+NqrvQq
I8aeRrnanXgffI1P+cKL3K1d
-----END PRIVATE KEY-----`;

const DEV_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvIGrklFkEFEKgFeAeriE
M13jOt3TkJaZU4tjpoS7CzpQyQsYO4JrGwjAk+JgtzDyT7v8qguDagwo3fNwh8dz
/kntARPd3t3cdWPOBZLrugy8zKpm4vBZEIu3mZuf5Vhuo8r7/iBSbwPe8GB+txAb
qj62YJqVeplmT/KtxjQiYij2zSUbODtEV/x6jr8McOvvZMLfbHt1UaK0Gf3PYmLl
504wOJ9/LVpIzYlFzl5vRy9A7GTPMwZOQpESFbw5GYM3+aIMoBMHq9zzgW5vvk2D
5wQuOCzXta2KBDjwXrQ3ipZf4b8Ln1J522QJHy+Gv27VhJDl+4LkNXJeQWM8rRi1
zQIDAQAB
-----END PUBLIC KEY-----`;

// Helper to get keys from Env or Fallback
const getPrivateKey = () => process.env.AUTH_PRIVATE_KEY || DEV_PRIVATE_KEY;
const getPublicKey = () => process.env.AUTH_PUBLIC_KEY || DEV_PUBLIC_KEY;

export async function encrypt(text: string): Promise<string> {
    const publicKeyPem = getPublicKey();
    const publicKey = await importSPKI(publicKeyPem, "RSA-OAEP-256");

    const jwe = await new CompactEncrypt(new TextEncoder().encode(text))
        .setProtectedHeader({ alg: "RSA-OAEP-256", enc: "A256GCM" })
        .encrypt(publicKey);

    return jwe;
}

export async function decrypt(jwe: string): Promise<string> {
    const privateKeyPem = getPrivateKey();
    const privateKey = await importPKCS8(privateKeyPem, "RSA-OAEP-256");

    const { plaintext } = await compactDecrypt(jwe, privateKey);
    return new TextDecoder().decode(plaintext);
}

export function getPublicPem(): string {
    return getPublicKey();
}
