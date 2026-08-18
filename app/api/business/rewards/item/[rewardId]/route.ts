import { prisma } from "@/lib/prisma";
import { verifyBusinessMember } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ rewardId: string }> }
) {
  try {
    const { rewardId } = await params;
    const auth = await verifyBusinessMember(req, ["OWNER", "MANAGER"]);
    if (!auth) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, stampsRequired, status } = body;

    const existing = await prisma.loyaltyReward.findFirst({
      where: {
        id: rewardId,
        businessId: auth.businessId,
      },
    });

    if (!existing) {
      return Response.json({ message: "Reward not found" }, { status: 404 });
    }

    const reward = await prisma.loyaltyReward.update({
      where: { id: rewardId },
      data: {
        ...(name ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(stampsRequired && Number(stampsRequired) > 0 ? { stampsRequired: Number(stampsRequired) } : {}),
        ...(status ? { status } : {}),
      },
    });

    return Response.json({ message: "Reward updated successfully", reward }, { status: 200 });
  } catch (error) {
    console.error("Reward update error:", error);
    return Response.json({ message: "Failed to update reward" }, { status: 500 });
  }
}
