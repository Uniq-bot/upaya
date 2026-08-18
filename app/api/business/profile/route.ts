import { prisma } from "@/lib/prisma";
import { verifyBusinessMember } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const auth = await verifyBusinessMember(req);
    if (!auth) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const business = await prisma.business.findUnique({
      where: { id: auth.businessId },
    });

    if (!business) {
      return Response.json({ message: "Business not found" }, { status: 404 });
    }

    return Response.json({ business }, { status: 200 });
  } catch (error) {
    console.error("Profile GET error:", error);
    return Response.json({ message: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await verifyBusinessMember(req, ["OWNER"]);
    if (!auth) {
      return Response.json({ message: "Only business owners can update settings" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, phone, address } = body;

    const business = await prisma.business.update({
      where: { id: auth.businessId },
      data: {
        ...(name ? { name } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(address !== undefined ? { address } : {}),
      },
    });

    return Response.json({ message: "Business settings updated", business }, { status: 200 });
  } catch (error) {
    console.error("Profile update error:", error);
    return Response.json({ message: "Failed to update settings" }, { status: 500 });
  }
}
