import { ReceiptData } from "./printer"

// This is a placeholder for the actual thermal printer logic.
// In a real implementation, we would use a library like 'escpos-xml' or custom byte commands.
// Since we are running in the browser, valid strategies are:
// 1. WebUSB/WebSerial: Direct connection (Chrome only, HTTPS required)
// 2. IP Printing: Sending raw socket data (Requires proxy/bridge due to CORS)
// 3. Browser Print: Formatting HTML to look like a receipt (Most compatible, least control)

// Strategy 3 (Browser Print) is implemented in `printer.ts` as the fallback.
// Strategy 2 (IP Printing)
export async function printToNetworkPrinter(ip: string, port: number = 9100, data: ReceiptData) {
    // NOTE: Direct TCP sockets are NOT possible in standard browser JS.
    // We would need a backend proxy or a local bridge (like QZ Tray).

    // However, some modern printers support ePOS-Print XML via HTTP POST.
    // Example for Epson ePOS:
    const xml = `
    <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
        <s:Body>
            <epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">
                <text lang="en"/>
                <text font="font_a"/>
                <text smooth="true"/>
                <text align="center"/>
                <text width="2" height="2">${data.storeName}</text>
                <feed/>
                <text width="1" height="1">${data.storeAddress}</text>
                <feed line="2"/>
                <text align="left"/>
                <text>Order: ${data.orderId}</text>
                <feed/>
                ...
                <cut type="feed"/>
            </epos-print>
        </s:Body>
    </s:Envelope>
    `

    try {
        // ePOS usually runs on port 80 or 8043 (SSL)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        const res = await fetch(`http://${ip}/cgi-bin/epos/service.cgi?devid=local_printer&timeout=10000`, {
            method: 'POST',
            body: xml,
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'SOAPAction': '""'
            },
            signal: controller.signal
        })
        clearTimeout(timeoutId)

        if (!res.ok) throw new Error("Printer responded with error")
        return true
    } catch (e) {
        console.error("Network Print Error:", e)
        throw e
    }
}
