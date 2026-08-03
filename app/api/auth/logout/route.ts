import { NextResponse } from "next/server";

export const POST = () => {
  return NextResponse.json(
    {
      success: true,
      message: "Logged out",
    },
    { status: 200 }
  );
};
