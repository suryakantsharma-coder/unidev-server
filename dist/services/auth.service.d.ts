import { IUser } from '../models/User.model';
export interface RegisterInput {
    name: string;
    email: string;
    password: string;
    role?: IUser['role'];
}
export interface LoginInput {
    email: string;
    password: string;
}
export declare function registerUser(input: RegisterInput): Promise<{
    token: string;
    user: {
        id: import("mongoose").Types.ObjectId;
        name: string;
        email: string;
        role: import("../models/User.model").UserRole;
    };
}>;
export declare function loginUser(input: LoginInput): Promise<{
    token: string;
    user: {
        id: import("mongoose").Types.ObjectId;
        name: string;
        email: string;
        role: import("../models/User.model").UserRole;
    };
}>;
//# sourceMappingURL=auth.service.d.ts.map