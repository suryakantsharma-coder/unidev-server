import jwt, { SignOptions } from 'jsonwebtoken';
import { User, IUser } from '../models/User.model';
import { env } from '../config/env';

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

function signToken(userId: string, role: string): string {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign({ id: userId, role }, env.JWT_SECRET, options);
}

export async function registerUser(input: RegisterInput) {
  const existing = await User.findOne({ email: input.email });
  if (existing) throw Object.assign(new Error('Email already registered'), { statusCode: 409 });

  const user = await User.create({
    name: input.name,
    email: input.email,
    password: input.password,
    role: input.role ?? 'agent',
  });

  const token = signToken(String(user._id), user.role);
  return { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } };
}

export async function loginUser(input: LoginInput) {
  const user = await User.findOne({ email: input.email }).select('+password');
  if (!user || !user.isActive) {
    throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
  }

  const match = await user.comparePassword(input.password);
  if (!match) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });

  const token = signToken(String(user._id), user.role);
  return { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } };
}
