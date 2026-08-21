import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

async function verifyAdminAuth() {
  const tokenCookie = (await cookies()).get("adminToken")?.value;
  if (!tokenCookie) {
    return { authorized: false, error: "Unauthorized: Missing token", status: 401 };
  }

  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    return { authorized: false, error: "Server misconfiguration: JWT_SECRET missing", status: 500 };
  }

  try {
    const decoded = jwt.verify(tokenCookie, JWT_SECRET) as { sub: string; role: string };
    if (decoded.role !== "ADMIN") {
      return { authorized: false, error: "Forbidden: Admin access required", status: 403 };
    }
    return { authorized: true, adminId: decoded.sub };
  } catch {
    return { authorized: false, error: "Unauthorized: Invalid or expired token", status: 401 };
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminAuth();
  if (!auth.authorized) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;

    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        program: true,
        members: {
          where: { role: "OWNER" },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                createdAt: true,
              },
            },
          },
        },
        _count: {
          select: {
            customers: true,
            rewards: true,
            stamps: true,
            redemptions: true,
            members: true,
          },
        },
      },
    });

    if (!business) {
      return Response.json({ error: "Business not found" }, { status: 404 });
    }

    const ownerMember = business.members[0];

    return Response.json({
      id: business.id,
      name: business.name,
      slug: business.slug,
      email: business.email,
      phone: business.phone,
      address: business.address,
      program: business.program,
      createdAt: business.createdAt,
      updatedAt: business.updatedAt,
      owner: ownerMember
        ? {
            id: ownerMember.user.id,
            email: ownerMember.user.email,
            firstName: ownerMember.user.firstName,
            lastName: ownerMember.user.lastName,
            createdAt: ownerMember.user.createdAt,
          }
        : null,
      counts: business._count,
    });
  } catch (error) {
    console.error("Admin fetch business detail error:", error);
    return Response.json({ error: "Failed to fetch business details" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminAuth();
  if (!auth.authorized) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const {
      name,
      slug,
      email,
      phone,
      address,
      ownerFirstName,
      ownerLastName,
      ownerEmail,
      ownerPassword,
    } = body;

    const existingBusiness = await prisma.business.findUnique({
      where: { id },
      include: {
        members: {
          where: { role: "OWNER" },
          include: { user: true },
        },
      },
    });

    if (!existingBusiness) {
      return Response.json({ error: "Business not found" }, { status: 404 });
    }

    // Process Slug
    let newSlug = slug ? slug.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-") : undefined;

    if (newSlug && newSlug !== existingBusiness.slug) {
      const slugCollision = await prisma.business.findUnique({ where: { slug: newSlug } });
      if (slugCollision) {
        return Response.json({ error: "A business with this slug already exists" }, { status: 409 });
      }
    }

    const ownerMember = existingBusiness.members[0];

    // Execute update transaction
    const updated = await prisma.$transaction(async (tx) => {
      const updatedBiz = await tx.business.update({
        where: { id },
        data: {
          name: name ?? existingBusiness.name,
          slug: newSlug ?? existingBusiness.slug,
          email: email !== undefined ? email : existingBusiness.email,
          phone: phone !== undefined ? phone : existingBusiness.phone,
          address: address !== undefined ? address : existingBusiness.address,
        },
      });

      let updatedOwner = null;
      if (ownerMember) {
        const userUpdateData: {
          firstName?: string;
          lastName?: string;
          email?: string;
          passwordHash?: string;
        } = {};

        if (ownerFirstName !== undefined) userUpdateData.firstName = ownerFirstName;
        if (ownerLastName !== undefined) userUpdateData.lastName = ownerLastName;
        if (ownerEmail && ownerEmail !== ownerMember.user.email) {
          const emailCheck = await tx.user.findUnique({ where: { email: ownerEmail } });
          if (emailCheck) {
            throw new Error("EXISTS: Owner email is already in use by another user");
          }
          userUpdateData.email = ownerEmail;
        }
        if (ownerPassword && ownerPassword.trim() !== "") {
          userUpdateData.passwordHash = await bcrypt.hash(ownerPassword, 12);
        }

        if (Object.keys(userUpdateData).length > 0) {
          updatedOwner = await tx.user.update({
            where: { id: ownerMember.user.id },
            data: userUpdateData,
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          });
        } else {
          updatedOwner = {
            id: ownerMember.user.id,
            email: ownerMember.user.email,
            firstName: ownerMember.user.firstName,
            lastName: ownerMember.user.lastName,
          };
        }
      }

      return { business: updatedBiz, owner: updatedOwner };
    });

    return Response.json(updated);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Failed to update business";
    console.error("Admin update business error:", error);
    if (errMessage.startsWith("EXISTS:")) {
      return Response.json({ error: errMessage.replace("EXISTS: ", "") }, { status: 409 });
    }
    return Response.json({ error: errMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminAuth();
  if (!auth.authorized) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;

    const existingBusiness = await prisma.business.findUnique({
      where: { id },
      include: {
        members: {
          where: { role: "OWNER" },
          select: { userId: true },
        },
      },
    });

    if (!existingBusiness) {
      return Response.json({ error: "Business not found" }, { status: 404 });
    }

    const ownerUserIds = existingBusiness.members.map((m) => m.userId);

    await prisma.$transaction(async (tx) => {
      // Delete business (Prisma schema cascade deletes loyalty program, members, customers, stamps, rewards, redemptions)
      await tx.business.delete({
        where: { id },
      });

      // Optionally clean up orphan owner accounts if they don't belong to any other business
      for (const userId of ownerUserIds) {
        const remainingMemberships = await tx.businessMember.count({
          where: { userId },
        });
        if (remainingMemberships === 0) {
          await tx.user.delete({
            where: { id: userId },
          });
        }
      }
    });

    return Response.json({ message: "Business deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Admin delete business error:", error);
    return Response.json({ error: "Failed to delete business" }, { status: 500 });
  }
}
