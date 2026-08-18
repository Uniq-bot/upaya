import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;
    const body = await req.json();
    const { rewardId } = body;

    if (!rewardId) {
      return Response.json(
        { message: "Reward ID is required" },
        { status: 400 }
      );
    }

    // Check authorization: business token OR customer context
    const businessToken = (await cookies()).get("upaya_businessToken")?.value;

    let businessId: string | null = null;
    if (businessToken) {
      try {
        const decoded = jwt.verify(
          businessToken,
          process.env.JWT_SECRET!
        ) as { sub: string };

        const membership = await prisma.businessMember.findFirst({
          where: { userId: decoded.sub },
        });
        if (membership) {
          businessId = membership.businessId;
        }
      } catch {
        // Token invalid, proceed with checking customer record
      }
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return Response.json({ message: "Customer not found" }, { status: 404 });
    }

    if (businessId && customer.businessId !== businessId) {
      return Response.json(
        { message: "Customer does not belong to your business" },
        { status: 403 }
      );
    }

    const reward = await prisma.loyaltyReward.findUnique({
      where: { id: rewardId },
    });

    if (!reward || reward.status !== "ACTIVE") {
      return Response.json(
        { message: "Active reward not found" },
        { status: 404 }
      );
    }

    if (customer.stampBalance < reward.stampsRequired) {
      return Response.json(
        {
          message: `Insufficient stamps. Required: ${reward.stampsRequired}, Available: ${customer.stampBalance}`,
        },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedCustomer = await tx.customer.update({
        where: { id: customerId },
        data: {
          stampBalance: {
            decrement: reward.stampsRequired,
          },
        },
      });

      const redemption = await tx.rewardRedemption.create({
        data: {
          businessId: customer.businessId,
          customerId: customer.id,
          rewardId: reward.id,
          stampsUsed: reward.stampsRequired,
          status: "COMPLETED",
        },
      });

      await tx.stampLedger.create({
        data: {
          businessId: customer.businessId,
          customerId: customer.id,
          amount: -reward.stampsRequired,
          type: "REDEEM",
          description: `Redeemed reward: ${reward.name}`,
        },
      });

      return {
        redemption,
        customer: updatedCustomer,
      };
    });

    return Response.json(
      {
        message: "Reward redeemed successfully!",
        ...result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Redemption error:", error);
    return Response.json(
      { message: "Failed to redeem reward" },
      { status: 500 }
    );
  }
}