// app/api/product/route.ts
import axios from 'axios';
import { NextResponse } from 'next/server';

const EXTERNAL = process.env.EXTERNAL_API_BASE;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const product_id = url.searchParams.get('product_id');
    if (!product_id) {
      return NextResponse.json({ error: 'Missing product_id' }, { status: 400 });
    }
    const target = `${EXTERNAL}/api/web/v1/product?product_id=${encodeURIComponent(product_id)}`;
    const resp = await axios.get(target);
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const target = `${EXTERNAL}/api/web/v1/product`;
    const resp = await axios.post(target, body);
    return NextResponse.json(resp.data, { status: resp.status });
  } catch (err: unknown) {
  if (err instanceof Error) {
    console.error(err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
  console.error('Unknown error', err);
  return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
}

}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const target = `${EXTERNAL}/api/web/v1/product`;
    const resp = await axios.put(target, body);
    return NextResponse.json(resp.data, { status: resp.status });
  } catch (err: unknown) {
  if (err instanceof Error) {
    console.error(err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
  console.error('Unknown error', err);
  return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
}

}

/* Optional: if backend supports delete
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const product_id = url.searchParams.get('product_id');
    const target = `${EXTERNAL}/api/web/v1/product?product_id=${encodeURIComponent(product_id)}`;
    const resp = await axios.delete(target);
    return NextResponse.json(resp.data, { status: resp.status });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
*/
