# QA Checklist: The Quarters App

## 1. Authentication & Security
- [ ] Login works for all roles (Owner, Manager, Cashier, Kitchen).
- [ ] Unauthorized access to `/admin` redirects to login/home.
- [ ] Role-based access verified (Cashier cannot edit Menu).

## 2. Order Flow (Main Loop)
- [ ] User creates order -> Appears in Admin/KDS.
- [ ] Admin changes status -> Updates in User App (Realtime/Polling).
- [ ] Payment flow completes successfully.
- [ ] Stock deducts correctly (if inventory enabled).

## 3. Operations
- [ ] Cash Session: Open -> Register Sales -> Close -> Report matches.
- [ ] Z-Report generated correctly.

## 4. Stability
- [ ] Mobile view works (Responsive).
- [ ] No crash on bad network (Offline handling - optional/basic).
