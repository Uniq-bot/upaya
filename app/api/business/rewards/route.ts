import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, description, stampsRequired } = body;

    if (!name || !stampsRequired) {
      return Response.json(
        {
          message: "Name and stampsRequired are required",
        },
        { status: 400 }
      );
    }

    if (stampsRequired <= 0) {
      return Response.json(
        {
          message: "stampsRequired must be greater than 0",
        },
        { status: 400 }
      );
    }

    const token = (await cookies()).get(
      "upaya_businessToken"
    )?.value;

    if (!token) {
      return Response.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { sub } = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as {
      sub: string;
    };

    const membership = await prisma.businessMember.findFirst({
      where: {
        userId: sub,
      },
    });

    if (!membership) {
      return Response.json(
        { message: "Business not found" },
        { status: 404 }
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

    const reward = await prisma.loyaltyReward.create({
      data: {
       programId: program.id,
       businessId: membership.businessId,
       name,
       description,
       stampsRequired,
       status: "ACTIVE",
      },
    });

    return Response.json(
      {
        message: "Reward created successfully",
        reward,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        message: "Failed to create reward",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const token = (await cookies()).get("upaya_businessToken")?.value;

    if (!token) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { sub } = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { sub: string };

    const membership = await prisma.businessMember.findFirst({
      where: { userId: sub },
    });

    if (!membership) {
      return Response.json({ message: "Business not found" }, { status: 404 });
    }

    const rewards = await prisma.loyaltyReward.findMany({
      where: {
        businessId: membership.businessId,
        status: "ACTIVE",
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ rewards }, { status: 200 });
  } catch (error) {
    console.error("Failed to retrieve rewards:", error);
    return Response.json({ message: "Failed to retrieve rewards" }, { status: 500 });
  }
}



