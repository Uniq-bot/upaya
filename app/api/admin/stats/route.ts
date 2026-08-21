import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    const token = (await cookies()).get("adminToken")?.value;
    if (!token) {
      return Response.json({ error: "Unauthorized: Missing token" }, { status: 401 });
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      return Response.json({ error: "Server misconfiguration: JWT_SECRET missing" }, { status: 500 });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { sub: string; role: string };
      if (decoded.role !== "ADMIN") {
        return Response.json({ error: "Forbidden: Admin access required" }, { status: 403 });
      }
    } catch {
      return Response.json({ error: "Unauthorized: Invalid or expired token" }, { status: 401 });
    }

    const [totalBusinesses, totalOwners, totalCustomers, totalStampsResult, totalRedemptions] = await Promise.all([
      prisma.business.count(),
      prisma.businessMember.count({ where: { role: "OWNER" } }),
      prisma.customer.count(),
      prisma.stampLedger.aggregate({
        where: { type: "EARN" },
        _sum: { amount: true },
      }),
      prisma.rewardRedemption.count(),
    ]);

    return Response.json({
      totalBusinesses,
      totalOwners,
      totalCustomers,
      totalStampsIssued: totalStampsResult._sum.amount || 0,
      totalRedemptions,
    });
  } catch (error) {
    console.error("Admin stats fetch error:", error);
    return Response.json({ error: "Failed to fetch admin stats" }, { status: 500 });
  }
}
