
import { NextRequest, NextResponse } from "next/server";

const allowedOrigins = [
  "http://localhost:8081",
  "http://localhost:3000",
  "https://evermilan.vercel.app",
];

function corsHeaders(origin: string | null) {
  const headers = new Headers();

  if (origin && allowedOrigins.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Accept");
    headers.set("Vary", "Origin");
  }

  return headers;
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("origin")),
  });
}

export async function POST(request: NextRequest) {
  const response = NextResponse.json(
    {
      success: true,
      message: "Logged out successfully.",
    },
    {
      headers: corsHeaders(request.headers.get("origin")),
    }
  );

  response.cookies.set({
    name: "matrimonial_session",
    value: "",
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}