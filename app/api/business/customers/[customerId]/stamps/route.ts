import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;

    const body = await req.json();
    const { amount, description } = body;

    if (!amount || amount <= 0) {
      return Response.json(
        { message: "Valid stamp amount is required" },
        { status: 400 }
      );
    }

    const token = (await cookies()).get("upaya_businessToken")?.value;

    if (!token) {
      return Response.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { sub } = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { sub: string };

    const userId = sub;

    // Find the business of the logged-in user
    const membership = await prisma.businessMember.findFirst({
      where: {
        userId,
      },
    });

    if (!membership) {
      return Response.json(
        { message: "Business not found" },
        { status: 404 }
      );
    }

    // Make sure customer belongs to this business
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        businessId: membership.businessId,
      },
    });

    if (!customer) {
      return Response.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }

    // Add stamp + update balance atomically
    const result = await prisma.$transaction(async (tx) => {
      const stamp = await tx.stampLedger.create({
        data: {
          businessId: membership.businessId,
          customerId,
          amount,
          type: "EARN",
          description,
        },
      });

      const updatedCustomer = await tx.customer.update({
        where: {
          id: customerId,
        },
        data: {
        stampBalance:{
            increment: amount,
        },
        
        },
      });

      return {
        stamp,
        customer: updatedCustomer,
      };
    });

    return Response.json(
      {
        message: "Stamp added successfully",
        ...result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);

    return Response.json(
      { message: "Failed to add stamp" },
      { status: 500 }
    );
  }
}