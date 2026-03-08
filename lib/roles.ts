/**
 * System role definitions for AgentEmpire.
 *
 * Roles:
 *  - admin    Full access: create, edit, delete, configure settings
 *  - analyst  Read + create entries, no delete / settings
 *  - guest    Read-only view across all sections
 */

export type UserRole = "admin" | "analyst" | "guest";

export interface RoleDefinition {
  label: string;
  description: string;
  canCreate: boolean;
  canDelete: boolean;
  canSettings: boolean;
}

export const ROLES: Record<UserRole, RoleDefinition> = {
  admin: {
    label: "Admin",
    description: "Full access including settings and data management",
    canCreate: true,
    canDelete: true,
    canSettings: true,
  },
  analyst: {
    label: "Analyst",
    description: "Can view and create entries but cannot delete or change settings",
    canCreate: true,
    canDelete: false,
    canSettings: false,
  },
  guest: {
    label: "Guest",
    description: "Read-only access to all sections",
    canCreate: false,
    canDelete: false,
    canSettings: false,
  },
};

export function can(role: UserRole, action: keyof Omit<RoleDefinition, "label" | "description">): boolean {
  return ROLES[role][action];
}
