import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export interface OrderCustomer {
    name: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
}

export interface OrderPayload {
    productId: string;
    productName: string;
    productPrice: string | null;
    productImage: string;
    quantity: number;
    customer: OrderCustomer;
    notes?: string;
    userId?: string | null;
}

export async function POST(req: Request) {
    try {
        const body: OrderPayload = await req.json();
        const {
            productId,
            productName,
            productPrice,
            productImage,
            quantity = 1,
            customer,
            notes,
            userId,
        } = body;

        // Validation
        if (!productName || !productId) {
            return NextResponse.json(
                { error: "Product information is missing." },
                { status: 400 }
            );
        }

        if (!customer) {
            return NextResponse.json(
                { error: "Customer information is missing." },
                { status: 400 }
            );
        }

        const { name, phone, address, city, state, pincode } = customer;

        if (!name?.trim()) {
            return NextResponse.json(
                { error: "Please provide your full name." },
                { status: 400 }
            );
        }

        if (!phone?.trim() || phone.trim().length < 7) {
            return NextResponse.json(
                { error: "Please provide a valid contact phone number." },
                { status: 400 }
            );
        }

        if (!address?.trim()) {
            return NextResponse.json(
                { error: "Please provide your delivery address." },
                { status: 400 }
            );
        }

        if (!city?.trim() || !pincode?.trim()) {
            return NextResponse.json(
                { error: "City and Pincode are required for delivery." },
                { status: 400 }
            );
        }

        // Calculate numeric total if price contains numbers
        let numericPrice = 0;
        if (productPrice) {
            const parsed = parseFloat(productPrice.replace(/[^0-9.]/g, ""));
            if (!isNaN(parsed)) {
                numericPrice = parsed;
            }
        }
        const totalAmount = numericPrice > 0 ? numericPrice * quantity : null;

        const orderReferenceId = `BL-${Date.now().toString().slice(-6)}`;

        const orderData = {
            orderReferenceId,
            productId,
            productName,
            productPrice: productPrice || "Quote on Delivery",
            productImage: productImage || "/images/placeholder.jpg",
            quantity: Number(quantity) || 1,
            totalAmount: totalAmount ? `₹${totalAmount.toLocaleString("en-IN")}` : (productPrice || "Quote on Delivery"),
            numericTotal: totalAmount || 0,
            paymentMethod: "Cash on Delivery",
            status: "Pending", // Pending, Confirmed, Shipped, Delivered, Cancelled
            customer: {
                name: name.trim(),
                phone: phone.trim(),
                email: customer.email?.trim() || null,
                address: address.trim(),
                city: city.trim(),
                state: state?.trim() || "",
                pincode: pincode.trim(),
            },
            notes: notes?.trim() || "",
            userId: userId || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Write to Firestore "orders" collection
        const docRef = await db.collection("orders").add(orderData);

        return NextResponse.json(
            {
                success: true,
                orderId: docRef.id,
                orderReferenceId,
                message: "Order placed successfully via Cash on Delivery!",
                order: { id: docRef.id, ...orderData },
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Failed to save order to Firebase:", error);
        return NextResponse.json(
            { error: error.message || "Failed to process Cash on Delivery order." },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limitParam = parseInt(searchParams.get("limit") || "50", 10);

        const snapshot = await db
            .collection("orders")
            .orderBy("createdAt", "desc")
            .limit(limitParam)
            .get();

        const orders = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json({ success: true, orders });
    } catch (error: any) {
        console.error("Failed to fetch orders:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch orders." },
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json(
                { error: "Order ID and status are required." },
                { status: 400 }
            );
        }

        const validStatuses = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
                { status: 400 }
            );
        }

        await db.collection("orders").doc(id).update({
            status,
            updatedAt: new Date().toISOString(),
        });

        return NextResponse.json({
            success: true,
            message: `Order status updated to ${status}.`,
        });
    } catch (error: any) {
        console.error("Failed to update order:", error);
        return NextResponse.json(
            { error: error.message || "Failed to update order status." },
            { status: 500 }
        );
    }
}
