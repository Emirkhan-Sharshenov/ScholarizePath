import { googleLogin } from "@/services/auth.service";
import { withErrorHandler } from "@/middleware/error.middleware";

export const GET = withErrorHandler(googleLogin);
