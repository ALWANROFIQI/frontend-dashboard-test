import axios from 'axios';
import { NextResponse } from 'next/server';

const EXTERNAL = process.env.EXTERNAL_API_BASE;

export async function GET(req: Request) {
  try {
    if (!EXTERNAL) {
      console.error(' Missing EXTERNAL_API_BASE in .env.local');
      return NextResponse.json({ error: 'Backend URL not configured' }, { status: 500 });
    }

    const url = new URL(req.url);
    const searchParams = url.searchParams.toString();
    const target = `${EXTERNAL}/api/web/v1/products${searchParams ? `?${searchParams}` : ''}`;

    console.log('🔁 Fetching from backend:', target);

    const resp = await axios.get(target);
    return NextResponse.json(resp.data);
  } catch (err: unknown) {
  if (err instanceof Error) {
    console.error('❌ Fetch error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
  console.error('❌ Fetch error:', err);
  return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
}

}
