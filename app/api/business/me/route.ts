import { prisma } from "@/lib/prisma";
import { verifyBusinessMember } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const auth = await verifyBusinessMember(req);
    if (!auth) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.session.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    const business = await prisma.business.findUnique({
      where: { id: auth.businessId },
    });

    if (!user || !business) {
      return Response.json({ message: "User or business not found" }, { status: 404 });
    }

    return Response.json({
      user,
      business,
      role: auth.session.role,
    });
  } catch (error) {
    console.error("Failed to fetch session info:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
