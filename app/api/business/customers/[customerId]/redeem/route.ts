import { prisma } from "@/lib/prisma";
import { verifyBusinessMember } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ customerId: string }> }) {
  try {
    const { customerId } = await params;
    const auth = await verifyBusinessMember(req);
    if (!auth) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { rewardId } = body;
    if (!rewardId) {
      return Response.json({ message: "Reward ID required" }, { status: 400 });
    }

    const [customer, reward] = await Promise.all([
      prisma.customer.findFirst({
        where: { id: customerId, businessId: auth.businessId },
      }),
      prisma.loyaltyReward.findFirst({
        where: { id: rewardId, businessId: auth.businessId, status: "ACTIVE" },
      }),
    ]);

    if (!customer) {
      return Response.json({ message: "Customer not found" }, { status: 404 });
    }
    if (!reward) {
      return Response.json({ message: "Reward not found or inactive" }, { status: 404 });
    }

    if (customer.stampBalance < reward.stampsRequired) {
      return Response.json({ message: "Insufficient stamps for this reward" }, { status: 400 });
    }

    const code = crypto.randomUUID();

    await prisma.$transaction(async (tx) => {
      await tx.rewardRedemption.create({
        data: {
          businessId: auth.businessId,
          customerId,
          rewardId,
          stampsUsed: reward.stampsRequired,
          status: "COMPLETED",
        },
      });

      await tx.customer.update({
        where: { id: customerId },
        data: { stampBalance: { decrement: reward.stampsRequired } },
      });
    });

    return Response.json({ message: "Reward redeemed", code }, { status: 200 });
  } catch (error) {
    console.error("Redemption error:", error);
    return Response.json({ message: "Redemption failed" }, { status: 500 });
  }
}
