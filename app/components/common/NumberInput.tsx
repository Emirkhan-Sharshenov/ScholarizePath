'use client';

import type { InputHTMLAttributes } from 'react';

type NumberInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'inputMode' | 'value' | 'onChange'> & {
    value: string;
    onValueChange: (value: string) => void;
    /** Allow a fractional part (GPA, IELTS 6.5). */
    decimal?: boolean;
};

/**
 * A text field for scores. Not type="number": on phones with a Russian (or
 * any comma-decimal) keyboard the decimal pad shows "," instead of ".", and a
 * number input silently drops "6,5". Here a comma becomes a dot, anything
 * that isn't a digit is ignored, and only one decimal point is kept.
 */
export function NumberInput({ value, onValueChange, decimal = false, ...rest }: NumberInputProps) {
    const clean = (raw: string) => {
        const text = raw.replace(/,/g, '.').replace(decimal ? /[^\d.]/g : /\D/g, '');
        if (!decimal) return text;
        const dot = text.indexOf('.');
        return dot === -1 ? text : text.slice(0, dot + 1) + text.slice(dot + 1).replace(/\./g, '');
    };

    return (
        <input
            {...rest}
            type="text"
            inputMode={decimal ? 'decimal' : 'numeric'}
            autoComplete="off"
            value={value}
            onChange={(e) => onValueChange(clean(e.target.value))}
        />
    );
}

/** "6." and "." are still being typed; "" is empty. */
export const parseScore = (text: string): number | null => (text === '' || text === '.' ? null : Number(text));
