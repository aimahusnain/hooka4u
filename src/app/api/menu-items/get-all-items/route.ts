import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const allItems = await prisma.menuItems.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(allItems);
  } catch (error) {
    console.error('Error details:', error);
    return NextResponse.json(
      { error: "Failed to fetch menu items" },
      { status: 500 }
    );
  }
}