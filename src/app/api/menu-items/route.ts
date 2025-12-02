import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const allItems = await prisma.menuItems.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
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
    const { name, description, price, image } = body;

    const menuItem = await prisma.menuItems.create({
      data: {
        name,
        description,
        image: image || null, // Store base64 image
        price: 0,
      },
    });

    return NextResponse.json(menuItem, { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 }
    );
  }
}