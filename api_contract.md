# API Contract & Integrations

## Internal API (Server Actions & Route Handlers)
- `POST /api/orders`: Create new order.
- `PATCH /api/orders/:id/status`: Update status (KDS).
- `GET /api/inventory`: Get stock levels.

## Webhooks (Planned)
- `stripe_webhook`: Handle payment success/fail.
