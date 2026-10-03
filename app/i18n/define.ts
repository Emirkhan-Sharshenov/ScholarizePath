/**
 * Declares one message namespace in both languages. `ru` must have exactly
 * the shape of `en` (NoInfer stops TypeScript from widening T to fit it), so a
 * missing or misspelled Russian key is a compile error.
 */
export function defineMessages<T>(messages: { en: T; ru: NoInfer<T> }) {
    return messages;
}
