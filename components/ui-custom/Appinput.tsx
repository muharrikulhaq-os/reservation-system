"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { ChevronDown, Eye, EyeOff, Upload, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { SelectOption } from "@/types";

// ─────────────────────────────────────────
// SHARED PRIMITIVES
// ─────────────────────────────────────────

// -- Field Label --
interface AppLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}
export const AppLabel = ({
  children,
  required,
  className,
  ...props
}: AppLabelProps) => (
  <Label
    className={cn(
      "block text-[10px] font-semibold uppercase tracking-[0.06em]",
      "text-[var(--text-secondary)] mb-1.5",
      className,
    )}
    {...props}
  >
    {children}
    {required && <span className="ml-0.5 text-[var(--danger)]">*</span>}
  </Label>
);

// -- Field Error --
export const AppFieldError = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  if (!children) return null;
  return (
    <p
      className={cn(
        "mt-1.5 flex items-center gap-1 text-xs text-[var(--danger)]",
        className,
      )}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        className="shrink-0"
      >
        <circle cx="6" cy="6" r="5.5" stroke="currentColor" />
        <path
          d="M6 3.5v3M6 8v.5"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
      {children}
    </p>
  );
};

// -- Field Hint --
export const AppFieldHint = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  if (!children) return null;
  return (
    <p className={cn("mt-1.5 text-xs text-[var(--text-secondary)]", className)}>
      {children}
    </p>
  );
};

// -- Input base class helper --
const inputBase = (hasError?: boolean) =>
  cn(
    "h-10 w-full rounded-lg px-3",
    "border border-[var(--border-input)] bg-[var(--bg-card)]",
    "text-sm text-[var(--text-primary)]",
    "placeholder:text-[var(--text-disabled)]",
    "transition-all duration-150",
    "focus-visible:outline-none focus-visible:ring-0",
    "focus-visible:border-[1.5px] focus-visible:border-[var(--primary)]",
    "disabled:bg-[var(--bg-subtle)] disabled:text-[var(--text-disabled)] disabled:cursor-not-allowed",
    hasError && "border-[var(--danger)] focus-visible:border-[var(--danger)]",
  );

// ─────────────────────────────────────────
// 1. INPUT TEXT
// ─────────────────────────────────────────

export interface InputTextProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const InputText = React.forwardRef<HTMLInputElement, InputTextProps>(
  (
    {
      label,
      error,
      hint,
      required,
      leftIcon,
      rightIcon,
      className,
      id,
      type = "text",
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? `input-${label?.toLowerCase().replace(/\s+/g, "-")}`;
    return (
      <div className="w-full space-y-0">
        {label && (
          <AppLabel htmlFor={inputId} required={required}>
            {label}
          </AppLabel>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[var(--text-secondary)]">
              {leftIcon}
            </span>
          )}
          <Input
            ref={ref}
            id={inputId}
            type={type}
            className={cn(
              inputBase(!!error),
              leftIcon && "pl-9",
              rightIcon && "pr-9",
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute inset-y-0 right-3 flex items-center text-[var(--text-secondary)]">
              {rightIcon}
            </span>
          )}
        </div>
        <AppFieldError>{error}</AppFieldError>
        <AppFieldHint>{hint}</AppFieldHint>
      </div>
    );
  },
);
InputText.displayName = "InputText";

// ─────────────────────────────────────────
// 2. INPUT EMAIL  (type=email, alias InputText)
// ─────────────────────────────────────────

export const InputEmail = React.forwardRef<HTMLInputElement, InputTextProps>(
  (props, ref) => (
    <InputText
      ref={ref}
      {...props}
      type="email"
    />
  ),
);
InputEmail.displayName = "InputEmail";

// ─────────────────────────────────────────
// 3. INPUT PASSWORD
// ─────────────────────────────────────────

export type InputPasswordProps = Omit<InputTextProps, "rightIcon">;

export const InputPassword = React.forwardRef<
  HTMLInputElement,
  InputPasswordProps
>(
  (
    { label, error, hint, required, leftIcon, className, id, ...props },
    ref,
  ) => {
    const [show, setShow] = useState(false);
    const inputId = id ?? `input-${label?.toLowerCase().replace(/\s+/g, "-")}`;

    return (
      <div className="w-full">
        {label && (
          <AppLabel htmlFor={inputId} required={required}>
            {label}
          </AppLabel>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[var(--text-secondary)]">
              {leftIcon}
            </span>
          )}
          <Input
            ref={ref}
            id={inputId}
            type={show ? "text" : "password"}
            className={cn(
              inputBase(!!error),
              leftIcon && "pl-9",
              "pr-10",
              className,
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            tabIndex={-1}
            aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
            className="absolute inset-y-0 right-3 flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            {show ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <AppFieldError>{error}</AppFieldError>
        <AppFieldHint>{hint}</AppFieldHint>
      </div>
    );
  },
);
InputPassword.displayName = "InputPassword";

// ─────────────────────────────────────────
// 4. INPUT NUMBER
// ─────────────────────────────────────────

export interface InputNumberProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "onChange"
> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number | undefined) => void;
}

export const InputNumber = React.forwardRef<HTMLInputElement, InputNumberProps>(
  (
    { label, error, hint, required, onChange, className, id, ...props },
    ref,
  ) => {
    const inputId = id ?? `input-${label?.toLowerCase().replace(/\s+/g, "-")}`;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      onChange?.(raw === "" ? undefined : Number(raw));
    };

    return (
      <div className="w-full">
        {label && (
          <AppLabel htmlFor={inputId} required={required}>
            {label}
          </AppLabel>
        )}
        <Input
          ref={ref}
          id={inputId}
          type="number"
          onChange={handleChange}
          className={cn(inputBase(!!error), className)}
          {...props}
        />
        <AppFieldError>{error}</AppFieldError>
        <AppFieldHint>{hint}</AppFieldHint>
      </div>
    );
  },
);
InputNumber.displayName = "InputNumber";

// ─────────────────────────────────────────
// 5. INPUT RUPIAH
// Format: Rp 1.000.000 - store as number
// ─────────────────────────────────────────

export interface InputRupiahProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "onChange" | "value"
> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  value?: number | undefined;
  onChange?: (value: number | undefined) => void;
}

const formatRupiah = (n: number) => new Intl.NumberFormat("id-ID").format(n);

const parseRupiah = (s: string): number | undefined => {
  const cleaned = s.replace(/\D/g, "");
  return cleaned === "" ? undefined : Number(cleaned);
};

export const InputRupiah = React.forwardRef<HTMLInputElement, InputRupiahProps>(
  (
    { label, error, hint, required, value, onChange, className, id, ...props },
    ref,
  ) => {
    const inputId = id ?? `input-${label?.toLowerCase().replace(/\s+/g, "-")}`;
    const [raw, setRaw] = useState(
      value !== undefined ? formatRupiah(value) : "",
    );

    // Sinkronkan tampilan saat `value` diubah dari luar (mis. prefill async).
    // Tidak memicu loop: saat user mengetik, value === angka saat ini.
    useEffect(() => {
      const current = parseRupiah(raw);
      if (value !== current) {
        setRaw(value !== undefined ? formatRupiah(value) : "");
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const numeric = parseRupiah(e.target.value);
      setRaw(numeric !== undefined ? formatRupiah(numeric) : "");
      onChange?.(numeric);
    };

    return (
      <div className="w-full">
        {label && (
          <AppLabel htmlFor={inputId} required={required}>
            {label}
          </AppLabel>
        )}
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-medium text-[var(--text-secondary)]">
            Rp
          </span>
          <Input
            ref={ref}
            id={inputId}
            inputMode="numeric"
            value={raw}
            onChange={handleChange}
            className={cn(inputBase(!!error), "pl-9", className)}
            {...props}
          />
        </div>
        <AppFieldError>{error}</AppFieldError>
        <AppFieldHint>{hint}</AppFieldHint>
      </div>
    );
  },
);
InputRupiah.displayName = "InputRupiah";

// ─────────────────────────────────────────
// 6. INPUT TEXTAREA
// ─────────────────────────────────────────

export interface InputTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  showCount?: boolean;
  maxLength?: number;
}

export const InputTextArea = React.forwardRef<
  HTMLTextAreaElement,
  InputTextAreaProps
>(
  (
    {
      label,
      error,
      hint,
      required,
      showCount,
      maxLength,
      className,
      id,
      value,
      onChange,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? `input-${label?.toLowerCase().replace(/\s+/g, "-")}`;
    const [count, setCount] = useState(String(value ?? "").length);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCount(e.target.value.length);
      onChange?.(e);
    };

    return (
      <div className="w-full">
        {label && (
          <AppLabel htmlFor={inputId} required={required}>
            {label}
          </AppLabel>
        )}
        <Textarea
          ref={ref}
          id={inputId}
          maxLength={maxLength}
          value={value}
          onChange={handleChange}
          className={cn(
            "w-full rounded-lg border border-[var(--border-input)] bg-[var(--bg-card)]",
            "px-3 py-2.5 text-sm text-[var(--text-primary)]",
            "placeholder:text-[var(--text-disabled)]",
            "resize-none transition-all duration-150",
            "focus-visible:outline-none focus-visible:ring-0",
            "focus-visible:border-[1.5px] focus-visible:border-[var(--primary)]",
            "disabled:bg-[var(--bg-subtle)] disabled:cursor-not-allowed",
            !!error &&
              "border-[var(--danger)] focus-visible:border-[var(--danger)]",
            className,
          )}
          {...props}
        />
        <div className="flex items-start justify-between mt-1.5">
          <AppFieldError>{error}</AppFieldError>
          {!error && <AppFieldHint>{hint}</AppFieldHint>}
          {showCount && maxLength && (
            <span className="ml-auto text-xs text-[var(--text-disabled)]">
              {count}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  },
);
InputTextArea.displayName = "InputTextArea";

// ─────────────────────────────────────────
// 7. INPUT FILE
// Drag & drop zone + file list
// ─────────────────────────────────────────

export interface InputFileProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  accept?: string;
  multiple?: boolean;
  maxSizeMb?: number;
  onChange?: (files: File[]) => void;
  className?: string;
}

export const InputFile = ({
  label,
  error,
  hint,
  required,
  accept,
  multiple = false,
  maxSizeMb = 10,
  onChange,
  className,
}: InputFileProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [sizeError, setSizeError] = useState<string | null>(null);

  const processFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const arr = Array.from(incoming);
    const oversized = arr.filter((f) => f.size > maxSizeMb * 1_048_576);
    if (oversized.length) {
      setSizeError(`File melebihi batas ${maxSizeMb}MB`);
      return;
    }
    setSizeError(null);
    const next = multiple ? [...files, ...arr] : arr;
    setFiles(next);
    onChange?.(next);
  };

  const removeFile = (idx: number) => {
    const next = files.filter((_, i) => i !== idx);
    setFiles(next);
    onChange?.(next);
  };

  const fmt = (bytes: number) =>
    bytes < 1_048_576
      ? `${(bytes / 1024).toFixed(0)} KB`
      : `${(bytes / 1_048_576).toFixed(1)} MB`;

  const displayError = error ?? sizeError;

  return (
    <div className={cn("w-full", className)}>
      {label && <AppLabel required={required}>{label}</AppLabel>}

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          processFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2",
          "rounded-lg border-[1.5px] border-dashed",
          "px-4 py-6 cursor-pointer transition-all duration-150",
          dragOver
            ? "border-[var(--primary)] bg-[var(--primary-light)]"
            : "border-[var(--border-input)] bg-[var(--bg-subtle)] hover:border-[var(--primary)] hover:bg-[var(--primary-light)]",
          displayError && "border-[var(--danger)]",
        )}
      >
        <Upload className="h-5 w-5 text-[var(--text-secondary)]" />
        <div className="text-center">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            Klik atau seret file ke sini
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {accept ?? "Semua format"} · Maks {maxSizeMb}MB
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={(e) => processFiles(e.target.files)}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 py-2 text-sm"
            >
              <span className="flex-1 truncate text-[var(--text-primary)]">
                {f.name}
              </span>
              <span className="shrink-0 text-xs text-[var(--text-secondary)]">
                {fmt(f.size)}
              </span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="shrink-0 text-[var(--text-secondary)] hover:text-[var(--danger)] transition-colors"
                aria-label={`Hapus ${f.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <AppFieldError>{displayError}</AppFieldError>
      <AppFieldHint>{hint}</AppFieldHint>
    </div>
  );
};

// ─────────────────────────────────────────
// 8. INPUT DATE
// ─────────────────────────────────────────

export type InputDateProps = Omit<InputTextProps, "type">;

export const InputDate = React.forwardRef<HTMLInputElement, InputDateProps>(
  (props, ref) => (
    <InputText
      ref={ref}
      {...props}
      type="date"
    />
  ),
);
InputDate.displayName = "InputDate";

// ─────────────────────────────────────────
// 9. INPUT DATETIME
// ─────────────────────────────────────────

export type InputDateTimeProps = Omit<InputTextProps, "type">;

export const InputDateTime = React.forwardRef<
  HTMLInputElement,
  InputDateTimeProps
>((props, ref) => (
  <InputText
    ref={ref}
    {...props}
    type="datetime-local"
  />
));
InputDateTime.displayName = "InputDateTime";

// ─────────────────────────────────────────
// 7. INPUT SELECT  (native <select>, styled)
// ─────────────────────────────────────────

export interface InputSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  placeholder?: string;
  options: SelectOption[];
}

export const InputSelect = React.forwardRef<
  HTMLSelectElement,
  InputSelectProps
>(
  (
    {
      label,
      error,
      hint,
      required,
      placeholder,
      options,
      className,
      id,
      ...props
    },
    ref,
  ) => {
    const selectId =
      id ?? `select-${label?.toLowerCase().replace(/\s+/g, "-")}`;
    return (
      <div className="w-full space-y-0">
        {label && (
          <AppLabel htmlFor={selectId} required={required}>
            {label}
          </AppLabel>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              inputBase(!!error),
              "cursor-pointer appearance-none pr-9",
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="">{placeholder}</option>
            )}
            {options.map((opt) => (
              <option key={String(opt.value)} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--text-secondary)]">
            <ChevronDown className="h-4 w-4" />
          </span>
        </div>
        <AppFieldError>{error}</AppFieldError>
        <AppFieldHint>{hint}</AppFieldHint>
      </div>
    );
  },
);
InputSelect.displayName = "InputSelect";

// ─────────────────────────────────────────
// BARREL - export semua dari satu tempat
// import { InputText, InputPassword, ... } from '@/components/ui-custom/AppInput'
// ─────────────────────────────────────────
