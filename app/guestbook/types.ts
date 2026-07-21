export interface GuestbookMessage {
    id: number;
    user_id: number;
    content: string;
    image_url: string | null;
    bg_color: string;
    status: string;
    author_name: string;
    created_at: string;
    location?: string | null;
}

export interface GuestbookSession {
    id: number;
}
