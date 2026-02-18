# Findings & Gap Analysis

## Current State
- **Repo**: `decuadros-v3` (Next.js + Prisma + Supabase).
- **Core**: Auth (NextAuth + Prisma Adapter), Menu, Orders (Basic), Admin Dashboard (v1).
- **Gamification**: Highly developed (Badges, Missions, Seasons, Pets).
- **Database**: PostgreSQL (Supabase) with Prisma ORM.

## Gaps vs Master Plan
1.  **RBAC**: Currently simple `role` string. Needs `Permission` model or complex checks for granular roles (manager, cashier, etc.).
2.  **Inventory**: Non-existent. Need `InventoryItem`, `StockMovement`, `Refill`.
3.  **POS/Cash**: Non-existent. Need `CashSession`, `ZReport`, `PettyCash`.
4.  **Multi-location**: Schema is single-tenant. Need `restaurantId`/`locationId` on ALL models for multi-local support.
5.  **KDS**: Basic order list exists, but real-time connection is not explicitly hooked up (uses polling or revalidatePath).
6.  **Audit**: No audit logs mechanism.

## Assumptions
- "The Quarters App" is the new name for this project.
- We will build on top of `decuadros-v3` preserving the gamification layer which seems valuable.
- "Owner" role will have full access.
- We will use `prisma` for everything, including RLS policies simulation via middleware or Supabase RLS directly (Note: Prisma bypasses RLS if using direct connection string, need to be careful with connection pooling or use `supa` client if RLS is strict requirement).
- **Decision**: We will enforce RBAC at the Application Layer (Next.js Middleware + API Routes) primary, and use RLS as a safeguard if connecting via Supabase Client directly (e.g. for Realtime).

## Next Steps
1.  Migrate Schema to support Inventory and POS.
2.  Implement "Location Awareness" (even if just 1 location default).
3.  Deploy KDS with Realtime.
