import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ businessSlug: string }> },
) {
  try {
    const { businessSlug } = await params;
    const business = await prisma.business.findUnique({
      where: {
        slug: businessSlug,
      },
      include: {
        program: true,
        members: true,
      },
    });

    if (!business) {
      return Response.json({ message: "Business not found" }, { status: 404 });
    }

    return Response.json({ business }, { status: 200 });
  } catch (error) {
    console.error(error);

    return Response.json(
      { message: "Failed to retrieve business" },
      { status: 500 },
    );
  }
}
