// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      customerName?: string;
      paymentType?: "CASH" | "CARD";
      Seating?: string;
      items?: { productId: string; quantity: number }[];
      subtotal?: number;
    };
    const { customerName, paymentType, Seating, items, subtotal } = body;

    // Validate request
    if (!customerName || !customerName.trim()) {
      return NextResponse.json(
        { error: "Customer name is required" },
        { status: 400 }
      );
    }

    // Validate Seating is provided
    if (!Seating || !Seating.trim()) {
      return NextResponse.json(
        { error: "Seating is required" },
        { status: 400 }
      );
    }

    // Default to CASH if paymentType is not provided
    const finalPaymentType = paymentType && ["CASH", "CARD"].includes(paymentType) 
      ? paymentType 
      : "CASH";

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Items are required" },
        { status: 400 }
      );
    }

    if (typeof subtotal !== "number") {
      return NextResponse.json(
        { error: "Subtotal is required" },
        { status: 400 }
      );
    }

    // Create order with items
    const order = await prisma.order.create({
      data: {
        customerName: customerName.trim(),
        paymentType: finalPaymentType,
        Seating: Seating.trim(),
        subtotal,
        items: {
          create: items.map((item: { productId: string; quantity: number }) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("id");

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Delete order items first (due to relation)
    await prisma.orderItem.deleteMany({
      where: {
        orderId: orderId,
      },
    });

    // Then delete the order
    await prisma.order.delete({
      where: {
        id: orderId,
      },
    });

    return NextResponse.json(
      { message: "Order deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}