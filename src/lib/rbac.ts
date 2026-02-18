import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export type Role = 'OWNER' | 'MANAGER' | 'CASHIER' | 'KITCHEN' | 'STAFF' | 'ACCOUNTANT' | 'USER'

export const ROLES = {
    OWNER: 'OWNER',
    MANAGER: 'MANAGER',
    CASHIER: 'CASHIER',
    KITCHEN: 'KITCHEN',
    STAFF: 'STAFF',
    ACCOUNTANT: 'ACCOUNTANT',
    USER: 'USER',
} as const

// Permission Matrix
// Resource -> Action -> Allowed Roles
const PERMISSIONS = {
    MENU: {
        VIEW: ['OWNER', 'MANAGER', 'CASHIER', 'KITCHEN', 'STAFF', 'USER'], // Public
        EDIT: ['OWNER', 'MANAGER'],
    },
    INVENTORY: {
        VIEW: ['OWNER', 'MANAGER', 'CASHIER', 'KITCHEN'],
        EDIT: ['OWNER', 'MANAGER'],
    },
    POS: {
        ACCESS: ['OWNER', 'MANAGER', 'CASHIER', 'STAFF'],
    },
    CASH: {
        MANAGE: ['OWNER', 'MANAGER', 'CASHIER'], // Open/Close sessions
    },
    KDS: {
        VIEW: ['OWNER', 'MANAGER', 'KITCHEN', 'STAFF'], // Staff can view to check status?
        UPDATE: ['OWNER', 'MANAGER', 'KITCHEN'],
    },
    REPORTS: {
        VIEW: ['OWNER', 'MANAGER', 'ACCOUNTANT'],
    },
    SETTINGS: {
        MANAGE: ['OWNER'],
    }
}

export async function getCurrentRole(): Promise<Role> {
    const session = await auth()
    if (!session?.user) return 'USER'
    return (session.user as any).role as Role || 'USER'
}

export function hasPermission(role: Role, resource: keyof typeof PERMISSIONS, action: string): boolean {
    const resourcePermissions = PERMISSIONS[resource] as any
    // @ts-ignore
    const allowedRoles = resourcePermissions[action] as Role[]
    if (!allowedRoles) return false
    return allowedRoles.includes(role)
}

export async function checkPermission(resource: keyof typeof PERMISSIONS, action: string): Promise<boolean> {
    const role = await getCurrentRole()
    return hasPermission(role, resource, action)
}

export async function enforcePermission(resource: keyof typeof PERMISSIONS, action: string) {
    const allowed = await checkPermission(resource, action)
    if (!allowed) {
        throw new Error("Unauthorized: Insufficient permissions")
    }
}

export async function protect(resource: keyof typeof PERMISSIONS, action: string, redirectUrl: string = '/app') {
    const allowed = await checkPermission(resource, action)
    if (!allowed) {
        redirect(redirectUrl)
    }
}
