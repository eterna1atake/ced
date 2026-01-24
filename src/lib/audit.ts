import clientPromise from "@/lib/mongodb";

export type LoginAuditStatus = "SUCCESS" | "FAILED" | "BLOCKED";

export type AuditLogEntry = {
    email: string;
    ip: string;
    userAgent?: string;
    status: LoginAuditStatus;
    reason?: string;
    timestamp?: Date;
};

const AUDIT_COLLECTION = "audit_login_logs";

export async function logLoginAttempt(entry: AuditLogEntry) {
    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB_NAME);

        await db.collection(AUDIT_COLLECTION).insertOne({
            ...entry,
            timestamp: new Date(), // Always force server timestamp
        });
    } catch (error) {
        // Fire and forget - logging shouldn't break the actual login flow
        console.error("[Audit] Failed to write log:", error);
    }
}
// System Audit Logs
export type SystemEventType =
    | "CHANGE_PASSWORD"
    | "CHANGE_PASSWORD_FAILED"
    | "UPDATE_PROFILE"
    | "CREATE_USER"
    | "DELETE_USER"
    | "CREATE_CONTENT"
    | "UPDATE_CONTENT"
    | "DELETE_CONTENT"
    | "LOGIN_OTP"
    | "OTHER";

export type SystemAuditEntry = {
    action: SystemEventType;
    actorEmail: string;
    details?: string;
    ip: string;
    userAgent?: string;
    timestamp?: Date;
    targetId?: string; // ID of the object being acted upon (if any)
};

const SYSTEM_AUDIT_COLLECTION = "audit_system_logs";

export async function logSystemEvent(entry: SystemAuditEntry) {
    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB_NAME);

        await db.collection(SYSTEM_AUDIT_COLLECTION).insertOne({
            ...entry,
            timestamp: new Date(),
        });

        console.log(`[Audit:System] ${entry.action} by ${entry.actorEmail}`);
    } catch (error) {
        console.error("[Audit] Failed to write system log:", error);
    }
}
