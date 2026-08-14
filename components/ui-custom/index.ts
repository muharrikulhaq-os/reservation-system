// ─────────────────────────────────────────
// UI-CUSTOM - BARREL EXPORT
// Wrapper Shadcn dengan design token proyek.
// import { AppButton, InputText, ... } from '@/components/ui-custom'
// ─────────────────────────────────────────

export { AppButton, IconButton } from "./Appbutton";
export type { AppButtonProps, IconButtonProps } from "./Appbutton";

export {
  AppLabel,
  AppFieldError,
  AppFieldHint,
  InputText,
  InputEmail,
  InputPassword,
  InputNumber,
  InputRupiah,
  InputTextArea,
  InputFile,
  InputDate,
  InputDateTime,
  InputSelect,
} from "./Appinput";
export type {
  InputTextProps,
  InputPasswordProps,
  InputNumberProps,
  InputSelectProps,
} from "./Appinput";

export { TimePicker, TIME_OPTIONS } from "./TimePicker";
export type { TimePickerProps } from "./TimePicker";
