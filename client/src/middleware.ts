import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Định nghĩa interface cho metadata của session
interface SessionMetadata {
  userType?: "student" | "teacher" | "admin";
}

const isStudentRoute = createRouteMatcher(["/user/(.*)"]);
const isTeacherRoute = createRouteMatcher(["/teacher/(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin/(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims } = await auth();

  // Ép kiểu sessionClaims.metadata sang SessionMetadata (có thể là null nếu không tồn tại)
  const metadata = sessionClaims?.metadata as SessionMetadata | null;

  // Nếu metadata hoặc userType chưa có, đợi và kiểm tra lại
  if (!metadata || !metadata.userType) {
    console.log("Metadata or userType not found. Waiting for data...");
    return NextResponse.next(); // Cho phép tiếp tục mà không chuyển hướng
  }

  const userRole = metadata.userType;

  console.log("Current URL:", req.url);
  console.log("User Role:", userRole);
  console.log("Is Student Route:", isStudentRoute(req));
  console.log("Is Teacher Route:", isTeacherRoute(req));
  console.log("Is Admin Route:", isAdminRoute(req));
  console.log("Full session claims:", sessionClaims);
  console.log("Metadata:", metadata);

  // Handle routing based on role
  if (isStudentRoute(req) && userRole !== "student") {
    if (userRole === "teacher") {
      console.log("Redirecting teacher to /teacher/courses");
      const url = new URL("/teacher/courses", req.url);
      return NextResponse.redirect(url);
    } else if (userRole === "admin") {
      console.log("Redirecting admin to /admin/dashboard");
      const url = new URL("/admin/dashboard", req.url);
      return NextResponse.redirect(url);

    }
  }

  if (isTeacherRoute(req) && userRole !== "teacher") {
    if (userRole === "student") {
      console.log("Redirecting student to /user/courses");
      const url = new URL("/user/courses", req.url);
      return NextResponse.redirect(url);
    } else if (userRole === "admin") {
      console.log("Redirecting admin to /admin/dashboard");
      const url = new URL("/admin/dashboard", req.url);
      return NextResponse.redirect(url);
    }
  }

  if (isAdminRoute(req) && userRole !== "admin") {
    if (userRole === "student") {
      console.log("Redirecting student to /user/courses");
      const url = new URL("/user/courses", req.url);
      return NextResponse.redirect(url);
    } else if (userRole === "teacher") {
      console.log("Redirecting teacher to /teacher/courses");
      const url = new URL("/teacher/courses", req.url);
      return NextResponse.redirect(url);

    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Loại trừ các route của Next.js và các file tĩnh
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Luôn chạy đối với API routes
    "/(api|trpc)(.*)",
  ],
};