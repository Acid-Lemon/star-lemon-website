import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '../../../lib/auth';
import { getOssClient, getPublicUrl, deleteFile, extractOssKey } from '../../../lib/oss';

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    if (!key) {
      return NextResponse.json({ error: 'Missing key parameter' }, { status: 400 });
    }

    const ossKey = extractOssKey(key);
    if (!ossKey) {
      return NextResponse.json({ error: 'Invalid key' }, { status: 400 });
    }
    const ownedPrefix = `uploads/${session.user.id}/`;
    if (session.user.role !== 'admin' && !ossKey.startsWith(ownedPrefix)) {
      return NextResponse.json({ error: '无权删除该文件' }, { status: 403 });
    }

    await deleteFile(ossKey);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete failed:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const key = `uploads/${session.user.id}/${fileName}`;

    const client = await getOssClient();
    await client.put(key, buffer);

    const publicUrl = await getPublicUrl(key);
    return NextResponse.json({ url: publicUrl, fileName, key });
  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
