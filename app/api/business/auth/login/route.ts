import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

import jwt from "jsonwebtoken";


const JWT_SECRET = process.env.JWT_SECRET;
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        
        
        memberships: {
          where: {
            role: "OWNER",
          },
          include: {
            business: true,
          },
        },
      },
    });
    console.log(user?.memberships[0])
    if (!user) {
      return Response.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!isMatch) {
      return Response.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const ownerMembership = user.memberships[0];

    if (!ownerMembership) {
      return Response.json(
        { message: "User is not a business owner" },
        { status: 403 }
      );
    }
    
     if (!JWT_SECRET) {
          throw new Error("JWT_SECRET is not configured");
        }
        const token = jwt.sign(
          {
            sub: user.id,
            email: user.email,
            role: user.memberships[0].role,
          },
          JWT_SECRET,
          {
            expiresIn: "7d",
          },
        );
         (await cookies()).set("upaya_businessToken", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
    

    return Response.json(
      {
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        business: ownerMembership.business,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);

    return Response.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}