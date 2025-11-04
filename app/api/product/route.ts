import axios from 'axios';
import { NextResponse } from 'next/server';

const EXTERNAL = process.env.EXTERNAL_API_BASE;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('product_id');
  const res = await axios.get(`${EXTERNAL}/api/web/v1/product?product_id=${id}`);
  return NextResponse.json(res.data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const res = await axios.post(`${EXTERNAL}/api/web/v1/product`, body);
  return NextResponse.json(res.data);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const res = await axios.put(`${EXTERNAL}/api/web/v1/product`, body);
  return NextResponse.json(res.data);
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('product_id');
  const res = await axios.delete(`${EXTERNAL}/api/web/v1/product?product_id=${id}`);
  return NextResponse.json(res.data);
}
