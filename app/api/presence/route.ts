import { NextRequest, NextResponse } from 'next/server';
import { heartbeat, removeVisitor, getOnlineCount, getPageReaders } from '@/lib/presence';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { visitorId, page, action } = body;

        if (!visitorId) {
            return NextResponse.json({ error: 'visitorId is required' }, { status: 400 });
        }

        if (action === 'leave') {
            removeVisitor(visitorId);
        } else {
            heartbeat(visitorId, page || '/');
        }

        const online = getOnlineCount();
        const readers = page ? getPageReaders(page) : 0;

        return NextResponse.json({ online, readers });
    } catch (error) {
        console.error('Presence heartbeat error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page');

    const online = getOnlineCount();
    const readers = page ? getPageReaders(page) : 0;

    return NextResponse.json({ online, readers });
}
