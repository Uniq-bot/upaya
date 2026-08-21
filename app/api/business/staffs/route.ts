import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { staffEmail, staffFirstName, staffLastName, password, role } = body;

    if (!staffEmail || !password) {
      return Response.json(
        { message: "Staff email and password are required" },
        { status: 400 }
      );
    }

    const token = (await cookies()).get("upaya_businessToken")?.value;

    if (!token) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { sub } = jwt.verify(token, process.env.JWT_SECRET as string) as {
      sub: string;
    };

    const userId = sub;

    const membership = await prisma.businessMember.findFirst({
      where: {
        userId,
        role: "OWNER",
      },
    });
    if (!membership) {
      return Response.json(
        { message: "You are not a business owner" },
        { status: 403 },
      );
    }

    const existingStaff = await prisma.businessMember.findFirst({
      where: {
        businessId: membership.businessId,
        user: {
          email: staffEmail,
        },
      },
    });

    if (existingStaff) {
      return Response.json(
        { message: "Staff member with this email already exists" },
        { status: 409 },
      );
    }

    const formattedRole = (role ? String(role).toUpperCase() : "STAFF") as "OWNER" | "MANAGER" | "STAFF";

    const newStaff = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: staffEmail,
          firstName: staffFirstName,
          lastName: staffLastName,
          passwordHash: await bcrypt.hash(password, 10),
        },
      });
      await tx.businessMember.create({
        data: {
          userId: user.id,
          businessId: membership.businessId,
          role: formattedRole,
        },
      });

      const staff = await tx.user.findUnique({
        where: {
          id: user.id,
        },
        include: {
          memberships: true,
        },
      });
      return staff;
    });

    return Response.json(newStaff, { status: 201 });
  } catch (error) {
    console.error("Failed to add staff:", error);
    return Response.json({ message: "Failed to add staff member" }, { status: 500 });
  }
}


export async function GET(req: Request) {
  const token = (await cookies()).get("upaya_businessToken")?.value;

  if (!token) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { sub } = jwt.verify(token, process.env.JWT_SECRET as string) as {
    sub: string;
  };

  const userId = sub;

  const membership = await prisma.businessMember.findFirst({
    where: {
      userId,
      role: {
        in: ["OWNER", "MANAGER"],
      },
    },
  });

  if (!membership) {
    return Response.json(
      { message: "You are not a business owner or manager" },
      { status: 403 },
    );
  }

  const staffMembers = await prisma.businessMember.findMany({
    where: {
      businessId: membership.businessId,
    },
    include: {
      user: true,
    },
  });

  return Response.json(staffMembers, { status: 200 });
}   