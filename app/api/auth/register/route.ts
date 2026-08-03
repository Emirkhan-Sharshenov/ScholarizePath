import { register } from "@/services/auth.service";
import { withErrorHandler } from "@/middleware/error.middleware";

export const POST = withErrorHandler(register);