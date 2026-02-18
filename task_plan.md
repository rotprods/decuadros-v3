# Task Plan: The Quarters App (Implementation Master)

## Fase 1: Auditoría y Base Técnica
- [ ] **Auditoría de Estado**
    - [ ] Documentar esquema actual vs objetivo en `schemas.md`.
    - [ ] Listar gaps funcionales en `findings.md`.
    - [ ] Definir estrategia de migración DB.
- [ ] **Configuración Base**
    - [ ] Normalizar variables de entorno (`.env`).
    - [ ] Verificar conexión Supabase (DB + Auth + Storage).
    - [ ] Configurar RLS (Row Level Security) inicial.
    - [ ] Implementar sistema de Roles (RBAC) en DB.
    - [ ] Seeds iniciales (Owner, Roles, Settings).

## Fase 2: Módulos Críticos (Core)
- [ ] **Productos & Menú (Avz)**
    - [ ] Migrar esquema: Variantes, Modificadores, Inventario.
    - [ ] Actualizar UI de Admin no solo para toggle status, sino gestión completa.
    - [ ] Implementar "Stock Aware" (si stock < 0, auto-disabled).
- [ ] **Pedidos & KDS (Realtime)**
    - [ ] Migrar esquema: `order_status_events`, `kitchen_notes`.
    - [ ] Implementar Supabase Realtime para KDS.
    - [ ] Vista de Cocina (KDS) optimizada.
- [ ] **Caja & POS**
    - [ ] Esquema: `cash_sessions`, `z_reports`, `payments`.
    - [ ] UI de Apertura/Cierre de Caja.
    - [ ] Registro de movimientos de efectivo.
- [ ] **Usuarios & RBAC Enforced**
    - [ ] Middleware para RBAC granular (Manager, Cashier, Kitchen).
    - [ ] RLS Policies para aislar datos si fuera multi-tenant (futuro) o solo seguridad.

## Fase 3: Módulos de Valor (Growth)
- [ ] **CRM & Fidelización**
    - [ ] Esquema: `loyalty_accounts`, `rewards`.
    - [ ] Sistema de puntos avanzado.
    - [ ] Segmentación básica.
- [ ] **Marketing**
    - [ ] Cupones complejos (2x1, Happy Hour).
    - [ ] Campañas de notificación (simuladas o email).
- [ ] **Informes**
    - [ ] Dashboard de Ventas avanzado (Márgenes, Top Items).
    - [ ] Exportaciones robustas (PDF/CSV).

## Fase 4: Integraciones y Hardening
- [ ] **API & Webhooks**
    - [ ] Endpoints para integraciones externas.
    - [ ] Webhook system.
- [ ] **Auditoría**
    - [ ] `audit_logs` para acciones críticas.
- [ ] **Testing & QA**
    - [ ] Smoke tests.
    - [ ] KDS Load test.

## Fase 5: Release
- [ ] Checklist de despliegue.
- [ ] Documentación final.
