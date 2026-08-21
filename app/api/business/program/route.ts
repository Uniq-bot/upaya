import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, stampsRequired } = body;

    if (!name || !stampsRequired) {
      return Response.json(
        {
          message: "Program name and stamps required are required",
        },
        { status: 400 }
      );
    }

    const token = (await cookies()).get("upaya_businessToken")?.value;

    if (!token) {
      return Response.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { sub } = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { sub: string };

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
        { status: 403 }
      );
    }

    const existingProgram = await prisma.loyaltyProgram.findUnique({
      where: {
        businessId: membership.businessId,
      },
    });

    if (existingProgram) {
      return Response.json(
        { message: "Business already has a loyalty program" },
        { status: 409 }
      );
    }

    const program = await prisma.loyaltyProgram.create({
      data: {
        businessId: membership.businessId,
        name,
        stampsRequired,
      },
    });

    return Response.json(
      {
        message: "Loyalty program created successfully",
        program,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return Response.json(
      { message: "Failed to create loyalty program" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const token = (await cookies()).get("upaya_businessToken")?.value;

  if (!token) {
    return Response.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { sub } = jwt.verify(
    token,
    process.env.JWT_SECRET as string
  ) as { sub: string };

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
      { status: 403 }
    );
  }

  const program = await prisma.loyaltyProgram.findUnique({
    where: {
      businessId: membership.businessId,
    },
  });

  if (!program) {
    return Response.json(
      { message: "Loyalty program not found" },
      { status: 404 }
    );
  }

  return Response.json({ program }, { status: 200 });
}