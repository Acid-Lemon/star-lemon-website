import type { Metadata } from 'next';
import RegisterClient from './register-client';

export const metadata: Metadata = {
    title: '注册',
    description: '创建你的账号',
};

export default function RegisterPage() {
    return <RegisterClient />;
}
