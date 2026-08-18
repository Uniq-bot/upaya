import { prisma } from "@/lib/prisma";
import { verifyBusinessMember } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;

    const auth = await verifyBusinessMember(req);
    if (!auth) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        businessId: auth.businessId,
      },
      include: {
        program: {
          include: {
            rewards: {
              where: { status: "ACTIVE" },
              orderBy: { stampsRequired: "asc" },
            },
          },
        },
        stamps: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        redemptions: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            reward: {
              select: { name: true, stampsRequired: true },
            },
          },
        },
      },
    });

    if (!customer) {
      return Response.json({ message: "Customer not found" }, { status: 404 });
    }

    return Response.json({ customer }, { status: 200 });
  } catch (error) {
    console.error("Customer fetch error:", error);
    return Response.json({ message: "Failed to retrieve customer" }, { status: 500 });
  }
}
