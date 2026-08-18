import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email } = body;

    if (!phone) {
      return Response.json(
        { message: "Phone is required" },
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

    const program = await prisma.loyaltyProgram.findUnique({
      where: {
        businessId: membership.businessId,
      },
    });

    if (!program) {
      return Response.json(
        { message: "Loyalty program has not been created yet" },
        { status: 404 }
      );
    }

    const existingCustomer = await prisma.customer.findUnique({
      where: {
        businessId_phone: {
          businessId: membership.businessId,
          phone,
        },
      },
    });

    if (existingCustomer) {
      return Response.json(
        { message: "Customer already exists" },
        { status: 409 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        businessId: membership.businessId,
        programId: program.id,
        phone,
        name,
        email,
      },
    });

    return Response.json(
      {
        message: "Customer created successfully",
        customer,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return Response.json(
      { message: "Failed to create customer" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
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

    const customers = await prisma.customer.findMany({
      where: {
        businessId: membership.businessId,
      },
    });

    return Response.json(
      {
        message: "Customers retrieved successfully",
        customers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);

    return Response.json(
      { message: "Failed to retrieve customers" },
      { status: 500 }
    );
  }
}