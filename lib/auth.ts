import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export interface AuthSession {
  userId: string;
  email: string;
  role: "ADMIN" | "OWNER" | "MANAGER" | "STAFF";
  businessId?: string;
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured in environment variables");
  }
  return secret;
}

/**
 * Extracts and verifies authentication token from Cookie or Authorization header
 */
export async function getAuthSession(
  req?: Request,
  cookieName: string = "upaya_businessToken"
): Promise<AuthSession | null> {
  try {
    const secret = getJwtSecret();
    let token: string | undefined = undefined;

    // 1. Try Cookie
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(cookieName)?.value;
    } catch {
      // Cookie context unavailable
    }

    // 2. Try Authorization Header
    if (!token && req) {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) return null;

    const decoded = jwt.verify(token, secret) as {
      sub: string;
      email: string;
      role: "ADMIN" | "OWNER" | "MANAGER" | "STAFF";
      businessId?: string;
    };

    return {
      userId: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      businessId: decoded.businessId,
    };
  } catch (error) {
    console.error("Auth session verification error:", error);
    return null;
  }
}

/**
 * Verifies Admin token specifically
 */
export async function verifyAdminSession(req?: Request): Promise<AuthSession | null> {
  const session = await getAuthSession(req, "adminToken");
  if (session && session.role === "ADMIN") {
    return session;
  }
  return null;
}

/**
 * Ensures user belongs to a business and has an allowed role
 */
export async function verifyBusinessMember(
  req: Request,
  allowedRoles: Array<"OWNER" | "MANAGER" | "STAFF"> = ["OWNER", "MANAGER", "STAFF"]
): Promise<{ session: AuthSession; businessId: string } | null> {
  const session = await getAuthSession(req, "upaya_businessToken");
  if (!session) return null;

  // Find business membership from DB to guarantee active status
  const membership = await prisma.businessMember.findFirst({
    where: {
      userId: session.userId,
    },
  });

  if (!membership) return null;

  if (!allowedRoles.includes(membership.role as "OWNER" | "MANAGER" | "STAFF")) {
    return null;
  }

  return {
    session: {
      ...session,
      role: membership.role as "OWNER" | "MANAGER" | "STAFF",
      businessId: membership.businessId,
    },
    businessId: membership.businessId,
  };
}

export function jsonResponse(data: unknown, status: number = 200) {
  return Response.json(data, { status });
}

export function unauthorizedResponse(message: string = "Unauthorized access") {
  return Response.json({ error: message, message }, { status: 401 });
}

export function forbiddenResponse(message: string = "Forbidden action") {
  return Response.json({ error: message, message }, { status: 403 });
}

export function badRequestResponse(message: string = "Bad request parameters") {
  return Response.json({ error: message, message }, { status: 400 });
}

export function serverErrorResponse(message: string = "Internal server error") {
  return Response.json({ error: message, message }, { status: 500 });
}
