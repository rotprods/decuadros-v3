import Stripe from "stripe"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-01-27.acacia",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
    const body = await req.text()
    const signature = req.headers.get("stripe-signature")!

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
        console.error("[Stripe Webhook] Invalid signature:", err)
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    // Handle successful payment
    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session
        const { orderId, userId } = session.metadata || {}

        try {
            // Update order payment status to PAID
            if (orderId) {
                await db.order.update({
                    where: { id: orderId },
                    data: {
                        paymentStatus: "PAID",
                        status: "PENDING", // Move to kitchen queue
                    },
                })
            }

            // Award loyalty points to user (50 points per order)
            if (userId) {
                const amountPaid = session.amount_total || 0
                const pointsEarned = Math.floor(amountPaid / 100) // 1 point per euro

                await db.user.update({
                    where: { id: userId },
                    data: {
                        points: { increment: pointsEarned },
                    },
                })

                console.log(`[Stripe Webhook] Awarded ${pointsEarned} points to user ${userId}`)
            }

            console.log(`[Stripe Webhook] Order ${orderId} marked as PAID`)
        } catch (dbError) {
            console.error("[Stripe Webhook] DB update failed:", dbError)
            // Return 200 anyway so Stripe doesn't retry — log the error
        }
    }

    // Handle failed payment
    if (event.type === "checkout.session.expired") {
        const session = event.data.object as Stripe.Checkout.Session
        const { orderId } = session.metadata || {}

        if (orderId) {
            await db.order.update({
                where: { id: orderId },
                data: { paymentStatus: "FAILED" },
            }).catch(console.error)
        }
    }

    return NextResponse.json({ received: true })
}
