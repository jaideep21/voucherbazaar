import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface http_header {
    value: string;
    name: string;
}
export interface UserProfile {
    displayName: string;
}
export interface Voucher {
    id: bigint;
    title: string;
    createdAt: bigint;
    sellingPrice: number;
    description: string;
    voucherCode: string;
    isSold: boolean;
    sellerName: string;
    category: string;
    sellerId: Principal;
    imageId: string;
    faceValue: number;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createVoucher(title: string, category: string, faceValue: number, sellingPrice: number, voucherCode: string, description: string, imageId: string, sellerName: string): Promise<bigint>;
    deleteVoucher(id: bigint): Promise<void>;
    extractTextFromImage(imageUrl: string): Promise<string>;
    extractTextTransform(input: TransformationInput): Promise<TransformationOutput>;
    getAvailableVouchers(): Promise<Array<Voucher>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyProfile(): Promise<string>;
    getMyVouchers(): Promise<Array<Voucher>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVouchersByCategory(category: string): Promise<Array<Voucher>>;
    isCallerAdmin(): Promise<boolean>;
    markAsSold(id: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setDisplayName(name: string): Promise<void>;
}
