import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { message: "Email and password are required" },
        { status: 400 },
      );
    }

    const adminUser = await prisma.admin.findFirst({
      where: {
        email,
        Role: "ADMIN",
      },
    });

    if (!adminUser) {
      return Response.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    const passwordValid = await bcrypt.compare(
      password,
      adminUser.passwordHash,
    );

    if (!passwordValid) {
      return Response.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }
    const token = jwt.sign(
      {
        sub: adminUser.id,
        email: adminUser.email,
        role: adminUser.Role,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );
     (await cookies()).set("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return Response.json(
      {
        message: "Login successful",
        token,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Login error:", error);

    return Response.json({ message: "Failed to login" }, { status: 500 });
  }
}
