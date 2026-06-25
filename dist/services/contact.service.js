"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContact = createContact;
exports.listContacts = listContacts;
exports.getContact = getContact;
exports.updateContact = updateContact;
exports.deleteContact = deleteContact;
exports.findOrCreateByPhone = findOrCreateByPhone;
const Contact_model_1 = require("../models/Contact.model");
const mongoose_1 = require("mongoose");
async function createContact(input) {
    const existing = await Contact_model_1.Contact.findOne({ phone: input.phone });
    if (existing)
        throw Object.assign(new Error('Contact with this phone already exists'), { statusCode: 409 });
    return Contact_model_1.Contact.create(input);
}
async function listContacts(filters) {
    const query = {};
    if (filters.assignedAgent)
        query.assignedAgent = new mongoose_1.Types.ObjectId(filters.assignedAgent);
    if (filters.tags?.length)
        query.tags = { $in: filters.tags };
    if (filters.search) {
        query.$or = [
            { name: { $regex: filters.search, $options: 'i' } },
            { phone: { $regex: filters.search, $options: 'i' } },
            { email: { $regex: filters.search, $options: 'i' } },
        ];
    }
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(100, filters.limit ?? 20);
    const skip = (page - 1) * limit;
    const [contacts, total] = await Promise.all([
        Contact_model_1.Contact.find(query).populate('assignedAgent', 'name email').skip(skip).limit(limit).lean(),
        Contact_model_1.Contact.countDocuments(query),
    ]);
    return { contacts, total, page, limit, pages: Math.ceil(total / limit) };
}
async function getContact(id) {
    const contact = await Contact_model_1.Contact.findById(id).populate('assignedAgent', 'name email');
    if (!contact)
        throw Object.assign(new Error('Contact not found'), { statusCode: 404 });
    return contact;
}
async function updateContact(id, input) {
    const contact = await Contact_model_1.Contact.findByIdAndUpdate(id, input, { new: true, runValidators: true });
    if (!contact)
        throw Object.assign(new Error('Contact not found'), { statusCode: 404 });
    return contact;
}
async function deleteContact(id) {
    const result = await Contact_model_1.Contact.findByIdAndDelete(id);
    if (!result)
        throw Object.assign(new Error('Contact not found'), { statusCode: 404 });
}
/** Find or create a contact by phone number — used by the webhook handler */
async function findOrCreateByPhone(phone, name) {
    let contact = await Contact_model_1.Contact.findOne({ phone });
    if (!contact) {
        contact = await Contact_model_1.Contact.create({ phone, name: name ?? phone });
    }
    return contact;
}
//# sourceMappingURL=contact.service.js.map