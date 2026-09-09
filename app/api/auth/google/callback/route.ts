import { googleCallback } from "@/services/auth.service";
import { withErrorHandler } from "@/middleware/error.middleware";

export const GET = withErrorHandler(googleCallback);
