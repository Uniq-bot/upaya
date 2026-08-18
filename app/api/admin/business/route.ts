import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    const tokenCookie = (await cookies()).get("adminToken")?.value;

    if (!tokenCookie) {
      return Response.json({ error: "Unauthorized: Missing token" }, { status: 401 });
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      return Response.json({ error: "Server misconfiguration: JWT_SECRET missing" }, { status: 500 });
    }

    try {
      const decoded = jwt.verify(tokenCookie, JWT_SECRET) as { sub: string; role: string };
      if (decoded.role !== "ADMIN") {
        return Response.json({ error: "Forbidden: Admin access required" }, { status: 403 });
      }
    } catch {
      return Response.json({ error: "Unauthorized: Invalid or expired token" }, { status: 401 });
    }

    const body = await request.json();

    const {
      businessName,
      businessEmail,
      businessPhone,
      businessAddress,
      ownerEmail,
      ownerFirstName,
      ownerLastName,
      ownerPassword,
    } = body;

    if (!businessName || !ownerEmail || !ownerPassword) {
      return Response.json(
        { error: "Business name, owner email, and owner password are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: ownerEmail },
    });

    if (existingUser) {
      return Response.json(
        { error: "An account with this owner email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(ownerPassword, 12);
    const cleanSlug = businessName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    const result = await prisma.$transaction(async (tx) => {
      const business = await tx.business.create({
        data: {
          name: businessName,
          email: businessEmail,
          phone: businessPhone,
          address: businessAddress,
          slug: cleanSlug,
        },
      });

      const user = await tx.user.create({
        data: {
          email: ownerEmail,
          passwordHash,
          firstName: ownerFirstName,
          lastName: ownerLastName,
        },
      });

      await tx.businessMember.create({
        data: {
          userId: user.id,
          businessId: business.id,
          role: "OWNER",
        },
      });

      return {
        business,
        owner: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      };
    });

    return Response.json(result, { status: 201 });
  } catch (error) {
    console.error("Admin business creation error:", error);

    return Response.json(
      { error: "Failed to create business" },
      { status: 500 }
    );
  }
}
