import { verify } from "@/services/auth.service";
import { withErrorHandler } from "@/middleware/error.middleware";

export const POST = withErrorHandler(verify);