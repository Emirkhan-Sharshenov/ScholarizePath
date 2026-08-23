import { logout } from "@/services/auth.service";
import { withErrorHandler } from "@/middleware/error.middleware";

export const POST = withErrorHandler(logout);
