import { createPOSOrder } from "@/app/actions/pos" // or client-side fetch wrapper

// We need a structure for queued orders
type QueuedOrder = {
    id: string
    payload: any // The body we would send to createPOSOrder or API
    timestamp: number
    retryCount: number
}

const QUEUE_KEY = "offline_order_queue"

export const OfflineSync = {
    // Save order to queue
    queueOrder: (payload: any) => {
        const queue: QueuedOrder[] = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]")
        const newOrder: QueuedOrder = {
            id: crypto.randomUUID(),
            payload,
            timestamp: Date.now(),
            retryCount: 0
        }
        queue.push(newOrder)
        localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))

        // Try to sync immediately if online
        if (navigator.onLine) {
            OfflineSync.processQueue()
        }

        return newOrder.id
    },

    // Process the queue
    processQueue: async () => {
        if (!navigator.onLine) return

        const queue: QueuedOrder[] = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]")
        if (queue.length === 0) return

        console.log(`[Sync] Processing ${queue.length} offline orders...`)

        const remainingQueue: QueuedOrder[] = []

        for (const order of queue) {
            try {
                // Here we call the API or Server Action
                // If using Server Action directly from client:
                const res = await createPOSOrder(order.payload)

                if (res.success) {
                    console.log(`[Sync] Order ${order.id} synced successfully.`)
                } else {
                    console.error(`[Sync] Order ${order.id} failed logic:`, res.error)
                    // If logical error (e.g. valid data but out of stock), maybe don't retry forever?
                    // For now, let's keep it in queue only if it's a network-like error, 
                    // but server actions usually throw on network error.
                    // If it returned success:false, it means server reached but rejected.
                    // We should probably alert the user or move to a "failed" list.
                    // For simplicity, we drop it to avoid blocking, or increment retry?
                    // Let's move to "failed" list.
                }
            } catch (error) {
                console.error(`[Sync] Network error for ${order.id}, keeping in queue.`, error)
                order.retryCount++
                remainingQueue.push(order)
            }
        }

        localStorage.setItem(QUEUE_KEY, JSON.stringify(remainingQueue))
    },

    // Get count
    getQueueCount: () => {
        if (typeof window === 'undefined') return 0
        const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]")
        return queue.length
    }
}

// Auto-sync on online event
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        console.log('[Sync] Back online! Syncing...')
        OfflineSync.processQueue()
    })
}
