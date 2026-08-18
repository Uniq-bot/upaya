import { prisma } from "@/lib/prisma";


export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get("slug");
        
        if (!slug) {
            return Response.json(
                { message: "Slug parameter is required (e.g. ?slug=my-business)" },
                { status: 400 }
            );
        }

        // Find business
        const business = await prisma.business.findUnique({
            where: {
                slug,
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

        return Response.json({
            message: "Business and loyalty rewards retrieved successfully",
            business: {
                id: business.id,
                name: business.name,
                slug: business.slug,
            },
            program: {
                id: business.program.id,
                name: business.program.name,
                stampsRequired: business.program.stampsRequired,
            },
            rewards: business.program.rewards,
        });
    } catch (error) {
        console.error("Error retrieving customer rewards:", error);       

        return Response.json(
            { message: "Failed to retrieve business and loyalty program" },
            { status: 500 }
        );
    }
}