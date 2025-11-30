import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust import path

export async function GET() {
  try {
    // Fetch all items and filter in JavaScript
    const allItems = await prisma.menuItems.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    // Filter for available items
    const menuItems = allItems.filter(item => item.available === true);
    
    return NextResponse.json(menuItems);
  } catch (error) {
    console.error('Error details:', error);
    return NextResponse.json(
      { error: "Failed to fetch menu items" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, price } = body;

    const menuItem = await prisma.menuItems.create({
      data: {
        name,
        description,
        price: 0, // Always 0 as per requirement
      },
    });

    return NextResponse.json(menuItem, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 }
    );
  }
}