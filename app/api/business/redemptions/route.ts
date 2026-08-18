import { prisma } from "@/lib/prisma";
import { verifyBusinessMember } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const auth = await verifyBusinessMember(req);
    if (!auth) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const redemptions = await prisma.rewardRedemption.findMany({
      where: {
        businessId: auth.businessId,
      },
      orderBy: { createdAt: "desc" },
      include: {
        customer: {
          select: { id: true, name: true, phone: true, email: true },
        },
        reward: {
          select: { id: true, name: true, description: true, stampsRequired: true },
        },
      },
    });

    return Response.json({ redemptions }, { status: 200 });
  } catch (error) {
    console.error("Redemptions fetch error:", error);
    return Response.json({ message: "Failed to retrieve redemptions" }, { status: 500 });
  }
}
