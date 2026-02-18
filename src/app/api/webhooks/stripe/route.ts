import Stripe from "stripe"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { headers } from "next/headers"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-01-27.acacia",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
    const body = await req.text()
    const signature = headers().get("Stripe-Signature") as string

    let event: Stripe.Event

    try {
        if (!signature || !webhookSecret) {
            console.error("Missing signature or webhook secret")
            return new NextResponse("Webhook Secret Missing", { status: 400 })
        }
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (error: any) {
        console.error(`Webhook Error: ${error.message}`)
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
    }

    try {
        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session
            const orderId = session.metadata?.orderId

            if (orderId) {
                console.log(`✅ Payment successful for Order ${orderId}`)

                await db.order.update({
                    where: { id: orderId },
                    data: {
                        status: "CONFIRMED", // Move from PENDING to CONFIRMED
                        paymentStatus: "PAID",
                        stripePaymentId: session.id
                    }
                })

                // Here we could also trigger notifications, print receipts, etc.
            } else {
                console.warn("⚠️ Webhook received but no orderId in metadata")
            }
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error("Error processing webhook:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
