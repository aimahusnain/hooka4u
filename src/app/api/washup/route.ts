import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { step } = await request.json();

    switch (step) {
      case "menu-prices":
        // Set all menu item prices to 0
        await prisma.menuItems.updateMany({
          data: { price: 0 },
        });
        return NextResponse.json({ success: true, step: "menu-prices" });

      case "menu-availability":
        // Set all menu items to unavailable
        await prisma.menuItems.updateMany({
          data: { available: false },
        });
        return NextResponse.json({ success: true, step: "menu-availability" });

      case "order-items":
        // Delete all order items
        await prisma.orderItem.deleteMany({});
        return NextResponse.json({ success: true, step: "order-items" });

      case "orders":
        // Delete all orders
        await prisma.order.deleteMany({});
        return NextResponse.json({ success: true, step: "orders" });

      case "users":
        // Delete all users
        await prisma.user.deleteMany({
          where: { role: "USER" },
        });
        return NextResponse.json({ success: true, step: "users" });

      default:
        return NextResponse.json({ message: "Invalid step" }, { status: 400 });
    }
  } catch (error) {
    console.error("Washup error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
