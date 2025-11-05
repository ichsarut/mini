import { NextRequest, NextResponse } from "next/server";
import { getUserByLineId, createUser, updateUser } from "@/lib/user";
import { UserFormData } from "@/types/user";

// GET /api/users?lineUserId=...
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lineUserId = searchParams.get("lineUserId");

    if (!lineUserId) {
      return NextResponse.json(
        { error: "lineUserId is required" },
        { status: 400 }
      );
    }

    const user = await getUserByLineId(lineUserId);

    if (!user) {
      return NextResponse.json(null, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error in GET /api/users:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lineUserId, formData, lineProfile } = body;

    if (!lineUserId || !formData) {
      return NextResponse.json(
        { error: "lineUserId and formData are required" },
        { status: 400 }
      );
    }

    const user = await createUser(
      lineUserId,
      formData as UserFormData,
      lineProfile
    );

    if (!user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/users:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

// PUT /api/users - Update user
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { lineUserId, formData } = body;

    if (!lineUserId || !formData) {
      return NextResponse.json(
        { error: "lineUserId and formData are required" },
        { status: 400 }
      );
    }

    const user = await updateUser(
      lineUserId,
      formData as Partial<UserFormData>
    );

    if (!user) {
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error in PUT /api/users:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
