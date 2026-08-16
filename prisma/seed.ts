/**
 * prisma/seed.ts
 * Seeds the initial SuperAdmin.
 */

import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
    connectionString,
});

const prisma = new PrismaClient({
    adapter,
});

async function main() {
    console.log("🌱 Seeding production database...");

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
        throw new Error(
            "ADMIN_EMAIL and ADMIN_PASSWORD must be defined"
        );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await prisma.admin.upsert({
        where: {
            email,
        },
        update: {
            Role: "ADMIN",
        },
        create: {
            email,
            passwordHash,
            Role: "ADMIN",
        },
    });

    console.log("✨ Seed complete!");

    console.log("\n🔑 Admin:");
    console.log(`  Email: ${admin.email}`);
    console.log(`  ID:    ${admin.id}`);
    console.log(`  Role:  ${admin.Role}`);
}

main()
    .catch((error) => {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });