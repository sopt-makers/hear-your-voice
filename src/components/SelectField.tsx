import { FieldBox, SelectV2 } from '@sopt-makers/ui';
import * as styles from './SelectField.css';

interface Option<T> {
  label: string;
  value: T;
}

interface SelectFieldProps<T extends string | number | boolean> {
  labelText?: string;
  descriptionText?: string;
  required?: boolean;
  placeholder?: string;
  options: Option<T>[];
  defaultValue?: Option<T> | null;
  onChange?: (value: T | T[]) => void;
  isError?: boolean;
}

function SelectField<T extends string | number | boolean>({
  labelText,
  descriptionText,
  required,
  placeholder,
  options,
  defaultValue,
  onChange,
  isError,
}: SelectFieldProps<T>) {
  return (
    <div className={styles.container}>
      <FieldBox.Label label={labelText} description={descriptionText} required={required} />
      <SelectV2.Root className={isError ? styles.error : undefined} type="text" defaultValue={defaultValue ?? null} onChange={onChange}>
        <SelectV2.Trigger>
          <SelectV2.TriggerContent placeholder={placeholder} />
        </SelectV2.Trigger>
        <SelectV2.Menu>
          {options.map((option) => (
            <SelectV2.MenuItem key={String(option.value)} option={option} />
          ))}
        </SelectV2.Menu>
      </SelectV2.Root>
    </div>
  );
}

export default SelectField;
