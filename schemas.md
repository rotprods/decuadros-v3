# Schema & Data Models

## Existing Models (Core)
- `User`: Extended with Gamification & Season Pass.
- `Order` / `OrderItem`: Basic commerce.
- `MenuItem` / `Category`: Catalog.

## New Models Required (The Quarters App)

### 1. Operations
```prisma
model Location {
  id        String   @id @default(cuid())
  name      String
  address   String
  phone     String?
  tables    Int      @default(0)
  active    Boolean  @default(true)
  
  orders    Order[]
  inventory InventoryItem[]
  cashSessions CashSession[]
}
```

### 2. Inventory
```prisma
model InventoryItem {
  id         String   @id @default(cuid())
  locationId String
  name       String
  quantity   Float
  unit       String   // kg, L, units
  minStock   Float    @default(0)
  cost       Float    @default(0)
  
  location   Location @relation(fields: [locationId], references: [id])
}
```

### 3. POS & Cash
```prisma
model CashSession {
  id           String    @id @default(cuid())
  locationId   String
  openedBy     String    // User ID
  closedBy     String?   // User ID
  startTime    DateTime  @default(now())
  endTime      DateTime?
  startAmount  Float
  endAmount    Float?
  discrepancy  Float?
  notes        String?
  
  location     Location  @relation(fields: [locationId], references: [id])
}
```

### 4. Audit
```prisma
model AuditLog {
  id        String   @id @default(cuid())
  userId    String
  action    String   // "UPDATE_PRICE", "VOID_ORDER"
  details   String   // JSON
  createdAt DateTime @default(now())
}
```

## Migration Strategy
1.  Create `Location` model and seed default "HQ".
2.  Add `locationId` to `Order` and `User` (optional employees).
3.  Add `Inventory` and `CashSession` models.
4.  Run `prisma db push`.
