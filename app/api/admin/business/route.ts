import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const token = (await cookies()).get("adminToken");

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
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

  if (!businessName || !ownerEmail) {
    return new Response(
      JSON.stringify({
        error: "Business name and owner email are required",
      }),
      { status: 400 },
    );
  }

  const passwordHash = await bcrypt.hash(ownerPassword, 12);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const business = await tx.business.create({
        data: {
          name: businessName,
          email: businessEmail,
          phone: businessPhone,
          address: businessAddress,
          slug: businessName.toLowerCase().trim().replace(/\s+/g, "-"),
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
        owner: user,
      };
    });

    return Response.json(result, { status: 201 });
  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({
        error: "Failed to create business",
      }),
      { status: 500 },
    );
  }
}
