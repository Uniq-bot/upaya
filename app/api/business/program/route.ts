import { cookies } from "next/headers";
import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
export async function POST(req: Request) {
  const formData = await req.formData();
    const userId= (await cookies()).get("upaya_token")?.value as string;
    // const verified= jwt.verify(userId, process.env.JWT_SECRET as string) as {userId:string}

  // const {businessId, role}= await getBusinessContext(userId)

  const programName = formData.get('programName') as string;

  console.log(programName);

  return NextResponse.json({ message: `Program name received: ${programName}` })
}
