import { IContact } from '../models/Contact.model';
import { Types } from 'mongoose';
export interface ContactInput {
    name: string;
    phone: string;
    email?: string;
    tags?: string[];
    notes?: string;
    assignedAgent?: string;
}
export declare function createContact(input: ContactInput): Promise<IContact>;
export declare function listContacts(filters: {
    assignedAgent?: string;
    tags?: string[];
    search?: string;
    page?: number;
    limit?: number;
}): Promise<{
    contacts: (import("mongoose").FlattenMaps<IContact> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[];
    total: number;
    page: number;
    limit: number;
    pages: number;
}>;
export declare function getContact(id: string): Promise<IContact>;
export declare function updateContact(id: string, input: Partial<ContactInput>): Promise<IContact>;
export declare function deleteContact(id: string): Promise<void>;
/** Find or create a contact by phone number — used by the webhook handler */
export declare function findOrCreateByPhone(phone: string, name?: string): Promise<IContact>;
//# sourceMappingURL=contact.service.d.ts.map