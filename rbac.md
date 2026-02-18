# Role Based Access Control (RBAC)

## User Roles
1.  **OWNER** (Jefe Supremo): Full access. Can edit settings, manage other admins.
2.  **MANAGER** (Encargado): Manage orders, inventory, cash sessions. Cannot delete critical data or change global settings.
3.  **CASHIER** (Caja): Create orders, process payments, open/close cash sessions. No menu editing.
4.  **KITCHEN** (Cocina): View KDS, update order status.
5.  **STAFF** (Camarero): Create orders at tables.
6.  **ACCOUNTANT**: Read-only access to reports and invoices.
7.  **USER** (Aficionado): Public app access only.

## Permissions Matrix
| Feature | Owner | Manager | Cashier | Kitchen | Staff | User |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Menu Edit** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Inventory** | ✅ | ✅ | ⚠️ (Read) | ⚠️ (Read) | ❌ | ❌ |
| **POS / Cash** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **KDS** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Reports** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Settings** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Order (Public)**| ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
