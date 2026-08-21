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

export async function GET(request: Request) {
  const auth = await verifyAdminAuth();
  if (!auth.authorized) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";

    const whereClause = query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" as const } },
            { slug: { contains: query, mode: "insensitive" as const } },
            { email: { contains: query, mode: "insensitive" as const } },
            { address: { contains: query, mode: "insensitive" as const } },
            {
              members: {
                some: {
                  role: "OWNER" as const,
                  user: {
                    OR: [
                      { email: { contains: query, mode: "insensitive" as const } },
                      { firstName: { contains: query, mode: "insensitive" as const } },
                      { lastName: { contains: query, mode: "insensitive" as const } },
                    ],
                  },
                },
              },
            },
          ],
        }
      : {};

    const businesses = await prisma.business.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        members: {
          where: { role: "OWNER" },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            customers: true,
            rewards: true,
            stamps: true,
            members: true,
          },
        },
      },
    });

    const formattedBusinesses = businesses.map((b) => {
      const ownerMember = b.members[0];
      return {
        id: b.id,
        name: b.name,
        slug: b.slug,
        email: b.email,
        phone: b.phone,
        address: b.address,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
        owner: ownerMember
          ? {
              id: ownerMember.user.id,
              email: ownerMember.user.email,
              firstName: ownerMember.user.firstName,
              lastName: ownerMember.user.lastName,
            }
          : null,
        counts: {
          customers: b._count.customers,
          rewards: b._count.rewards,
          stamps: b._count.stamps,
          members: b._count.members,
        },
      };
    });

    return Response.json(formattedBusinesses);
  } catch (error) {
    console.error("Admin list businesses error:", error);
    return Response.json({ error: "Failed to fetch businesses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await verifyAdminAuth();
  if (!auth.authorized) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  try {
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

    let cleanSlug = businessName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    if (!cleanSlug) {
      cleanSlug = `biz-${Date.now()}`;
    }

    // Ensure slug uniqueness
    const existingSlug = await prisma.business.findUnique({
      where: { slug: cleanSlug },
    });
    if (existingSlug) {
      cleanSlug = `${cleanSlug}-${Math.floor(Math.random() * 1000)}`;
    }

    const passwordHash = await bcrypt.hash(ownerPassword, 12);

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

      // Default Loyalty Program initialization
      await tx.loyaltyProgram.create({
        data: {
          businessId: business.id,
          name: `${businessName} Loyalty Rewards`,
          stampsRequired: 10,
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
