export interface EmergencyContact {
    name: string;
    phoneNumber: string;
    relationship: string;
}

export enum UserPermissions {
    MEMBER = "member",
    LEADER = "leader",
    ADMIN = "admin"
}

export interface Waiver {
    signed: boolean;
    signedDate?: Date;
    documentUrl?: string;
}

export interface Member {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    address: string;
    emergencyContact: EmergencyContact;
    role: UserPermissions;
    waiver: Waiver;
    isActive: boolean;
}
