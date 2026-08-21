import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    const token = (await cookies()).get("adminToken")?.value;

    if (!token) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    let decoded: { sub: string };

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        sub: string;
      };
    } catch {
      return Response.json(
        { message: "Invalid or expired token" },
        { status: 401 },
      );
    }

    if (!decoded.sub) {
      return Response.json(
        { message: "Invalid token payload" },
        { status: 401 },
      );
    }

    const me = await prisma.admin.findUnique({
      where: {
        id: decoded.sub,
      },
      select: {
        id: true,
        email: true,
        Role: true,
      },
    });

    if (!me) {
      return Response.json(
        { message: "Admin user not found" },
        { status: 404 },
      );
    }

    if (me.Role !== "ADMIN") {
      return Response.json({ message: "Forbidden" }, { status: 403 });
    }

    return Response.json({
      id: me.id,
      email: me.email,
      role: me.Role,
    });
  } catch (error) {
    console.error("Failed to fetch admin user info:", error);

    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
