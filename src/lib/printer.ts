import { jsPDF } from "jspdf"

// Define receipt data structure
export type ReceiptData = {
    storeName: string
    storeAddress: string
    orderId: string
    date: string
    items: {
        name: string
        quantity: number
        price: number
    }[]
    subtotal: number
    tax: number
    total: number
    paymentMethod: string
}

// Helper to generate a PDF blob for the receipt
// This is a "Universal" fallback that works on any device by printing via browser dialog/AirPrint
// For specific thermal printers (Epson/Star), we would use their specific SDKs or raw socket bytes.
export async function generateReceiptPDF(data: ReceiptData): Promise<Blob> {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, 200] // 80mm width, dynamic height approximation
    })

    doc.setFontSize(14)
    doc.text(data.storeName, 40, 10, { align: "center" })

    doc.setFontSize(10)
    doc.text(data.storeAddress, 40, 16, { align: "center" })

    doc.line(5, 20, 75, 20)

    doc.text(`Order: ${data.orderId}`, 5, 26)
    doc.text(`Date: ${data.date}`, 5, 30)

    let y = 38

    // Header
    doc.setFontSize(9)
    doc.text("Item", 5, y)
    doc.text("Qty", 50, y, { align: "right" })
    doc.text("Price", 75, y, { align: "right" })
    y += 4

    // Items
    data.items.forEach(item => {
        const title = item.name.length > 25 ? item.name.substring(0, 25) + '...' : item.name
        doc.text(title, 5, y)
        doc.text(item.quantity.toString(), 50, y, { align: "right" })
        doc.text((item.price * item.quantity).toFixed(2), 75, y, { align: "right" })
        y += 5
    })

    doc.line(5, y, 75, y)
    y += 5

    // Totals
    doc.text("Subtotal:", 40, y, { align: "right" })
    doc.text(data.subtotal.toFixed(2), 75, y, { align: "right" })
    y += 5

    doc.setFontSize(12)
    doc.text("TOTAL:", 40, y + 2, { align: "right" })
    doc.text(data.total.toFixed(2), 75, y + 2, { align: "right" })
    y += 10

    doc.setFontSize(10)
    doc.text(`Payment: ${data.paymentMethod}`, 40, y, { align: "center" })

    // Return Blob
    return doc.output("blob")
}

// Function to print via browser
export function printReceipt(data: ReceiptData) {
    generateReceiptPDF(data).then(blob => {
        const url = URL.createObjectURL(blob)
        const iframe = document.createElement("iframe")
        iframe.style.display = "none"
        iframe.src = url
        document.body.appendChild(iframe)

        iframe.onload = () => {
            iframe.contentWindow?.print()
            // Cleanup
            setTimeout(() => {
                document.body.removeChild(iframe)
                URL.revokeObjectURL(url)
            }, 60000)
        }
    })
}
