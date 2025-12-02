import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.username) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ message: "Password is required" }, { status: 400 })
    }

    // Find the current user
    const user = await prisma.user.findUnique({
      where: { username: session.user.username },
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Simple plain-text password comparison (as requested - no bcrypt)
    if (user.password !== password) {
      return NextResponse.json({ message: "Invalid password" }, { status: 401 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Password verification error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
