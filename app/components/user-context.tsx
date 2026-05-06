'use client';

import { createContext, useContext } from 'react';

export interface UserInfo {
    id: number;
    nickname: string;
    email: string;
    role: string;
    avatar: string | null;
    bio: string | null;
    birthday: string | null;
    qq_identifier: string | null;
}

const UserContext = createContext<UserInfo | null>(null);

export function UserProvider({
    user,
    children,
}: {
    user: UserInfo | null;
    children: React.ReactNode;
}) {
    return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
    return useContext(UserContext);
}
