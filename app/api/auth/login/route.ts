import { login } from "@/app/services/auth.service";
import { withErrorHandler } from "@/app/middleware/error.middleware";

export const POST = withErrorHandler(login)