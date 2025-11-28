import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch all orders from database
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Map orders and set default paymentType to CASH if null
    const ordersWithDefaults = orders.map((order) => ({
      ...order,
      paymentType: order.paymentType || "CASH",
    }));

    return NextResponse.json(ordersWithDefaults);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: `Failed to fetch orders ${error}` },
      { status: 500 }
    );
  }
}