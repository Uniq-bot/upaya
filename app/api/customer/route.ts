import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, phone } = body;

    if (!slug || !phone) {
      return Response.json(
        { message: "Slug and phone are required" },
        { status: 400 }
      );
    }

    // Find business
    const business = await prisma.business.findUnique({
      where: {
        slug,
      },
      include: {
        program: true,
      },
    });

    if (!business) {
      return Response.json(
        { message: "Business not found" },
        { status: 404 }
      );
    }

    if (!business.program) {
      return Response.json(
        { message: "This business has no loyalty program" },
        { status: 404 }
      );
    }

    // Find customer belonging to THIS business
    const customer = await prisma.customer.findUnique({
      where: {
        businessId_phone: {
          businessId: business.id,
          phone,
        },
      },
    });

    if (customer) {
      return Response.json({
        message: "Customer found",
        customer: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          stampBalance: customer.stampBalance,
        },
      });
    }

    // Customer doesn't exist yet
    return Response.json({
      message: "Customer not registered",
      business: {
        id: business.id,
        name: business.name,
      },
      program: {
        id: business.program.id,
        name: business.program.name,
      },
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

