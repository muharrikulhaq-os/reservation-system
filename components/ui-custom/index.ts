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
} from "./Appinput";
export type {
  InputTextProps,
  InputPasswordProps,
  InputNumberProps,
} from "./Appinput";

export { InputSelect } from "./InputSelect";
export { AppCheckbox } from "./AppCheckbox";
export type { AppCheckboxProps } from "./AppCheckbox";
export type { InputSelectProps, SelectChangeEvent } from "./InputSelect";

export { InputDate, InputDateTime } from "./DatePicker";
export type { DateChangeEvent, InputDateProps, InputDateTimeProps } from "./DatePicker";

export { TimePicker, TIME_OPTIONS } from "./TimePicker";
export type { TimePickerProps } from "./TimePicker";

export { SearchableSelect } from "./SearchableSelect";
export type {
  SearchableOption,
  SearchableOptionTone,
  SearchableSelectProps,
} from "./SearchableSelect";
