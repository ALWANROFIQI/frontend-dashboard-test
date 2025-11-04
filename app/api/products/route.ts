// app/api/products/route.ts
import axios from 'axios';
import { NextResponse } from 'next/server';

const EXTERNAL = process.env.EXTERNAL_API_BASE;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams.toString(); // ?page=1&limit=10&search=...
    const target = `${EXTERNAL}/api/web/v1/products${searchParams ? `?${searchParams}` : ''}`;

    const resp = await axios.get(target, {
      // jika perlu, tambahkan headers auth di sini
    });

    return NextResponse.json(resp.data);
  } catch (err: unknown) {
  if (err instanceof Error) {
    console.error(err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
  console.error('Unknown error', err);
  return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
}

}
