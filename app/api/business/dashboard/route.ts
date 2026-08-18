import { prisma } from "@/lib/prisma";
import { verifyBusinessMember } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const auth = await verifyBusinessMember(req);
    if (!auth) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const businessId = auth.businessId;

    // Aggregate counts
    const [customerCount, activeRewardsCount, totalRedemptionsCount, stampAgg] = await Promise.all([
      prisma.customer.count({ where: { businessId } }),
      prisma.loyaltyReward.count({ where: { businessId, status: "ACTIVE" } }),
      prisma.rewardRedemption.count({ where: { businessId } }),
      prisma.stampLedger.aggregate({
        where: { businessId, amount: { gt: 0 } },
        _sum: { amount: true },
      }),
    ]);

    const totalStampsIssued = stampAgg._sum.amount || 0;

    // Recent activity stream (last 10 items)
    const [recentStamps, recentRedemptions, recentCustomers] = await Promise.all([
      prisma.stampLedger.findMany({
        where: { businessId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          customer: {
            select: { name: true, phone: true },
          },
        },
      }),
      prisma.rewardRedemption.findMany({
        where: { businessId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          customer: { select: { name: true, phone: true } },
          reward: { select: { name: true } },
        },
      }),
      prisma.customer.findMany({
        where: { businessId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    // Format activities into unified chronological timeline
    type ActivityItem = {
      id: string;
      type: "STAMP" | "REDEMPTION" | "CUSTOMER";
      description: string;
      timestamp: string;
    };

    const activities: ActivityItem[] = [];

    recentStamps.forEach((s) => {
      const name = s.customer.name || s.customer.phone;
      activities.push({
        id: `stamp-${s.id}`,
        type: "STAMP",
        description: s.amount > 0 ? `${name} earned ${s.amount} stamp${s.amount > 1 ? "s" : ""}` : `${name} adjusted stamps (${s.amount})`,
        timestamp: s.createdAt.toISOString(),
      });
    });

    recentRedemptions.forEach((r) => {
      const name = r.customer.name || r.customer.phone;
      activities.push({
        id: `redemption-${r.id}`,
        type: "REDEMPTION",
        description: `${name} redeemed reward: "${r.reward.name}"`,
        timestamp: r.createdAt.toISOString(),
      });
    });

    recentCustomers.forEach((c) => {
      const name = c.name || c.phone;
      activities.push({
        id: `customer-${c.id}`,
        type: "CUSTOMER",
        description: `New customer joined: ${name}`,
        timestamp: c.createdAt.toISOString(),
      });
    });

    // Sort by timestamp desc & take top 10
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return Response.json({
      stats: {
        customers: customerCount,
        stampsIssued: totalStampsIssued,
        activeRewards: activeRewardsCount,
        redemptions: totalRedemptionsCount,
      },
      activities: activities.slice(0, 10),
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return Response.json({ message: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
