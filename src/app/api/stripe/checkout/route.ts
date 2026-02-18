import Stripe from "stripe"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-01-27.acacia",
})

export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { items, orderId } = await req.json()

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "No items provided" }, { status: 400 })
        }

        // Build Stripe line items from cart
        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item: {
            name: string
            price: number
            quantity: number
            image?: string
        }) => ({
            price_data: {
                currency: "eur",
                product_data: {
                    name: item.name,
                    ...(item.image ? { images: [item.image] } : {}),
                },
                unit_amount: Math.round(item.price * 100), // Stripe uses cents
            },
            quantity: item.quantity,
        }))

        // Create Stripe Checkout Session
        const checkoutSession = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.NEXTAUTH_URL}/app/order-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXTAUTH_URL}/app/cart`,
            metadata: {
                orderId: orderId || "",
                userId: session.user.id || "",
            },
            customer_email: session.user.email || undefined,
        })

        return NextResponse.json({ url: checkoutSession.url })
    } catch (error) {
        console.error("[Stripe Checkout Error]", error)
        return NextResponse.json(
            { error: "Failed to create checkout session" },
            { status: 500 }
        )
    }
}
