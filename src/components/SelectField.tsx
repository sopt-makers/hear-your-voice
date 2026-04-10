import { FieldBox, SelectV2 } from '@sopt-makers/ui';
import * as styles from './SelectField.css';

interface Option {
  label: string;
  value: string;
}

interface SelectFieldProps {
  labelText?: string;
  descriptionText?: string;
  required?: boolean;
  placeholder?: string;
  options: Option[];
  defaultValue?: Option | null;
  onChange?: (value: string) => void;
  isError?: boolean;
}

function SelectField({
  labelText,
  descriptionText,
  required,
  placeholder,
  options,
  defaultValue,
  onChange,
  isError,
}: SelectFieldProps) {
  return (
    <div className={styles.container} role="group" aria-invalid={isError ? true : undefined}>
      <FieldBox.Label label={labelText} description={descriptionText} required={required} />
      <SelectV2.Root
        type="text"
        defaultValue={defaultValue ?? null}
        onChange={(value) => onChange?.(value as string)}
      >
        <SelectV2.Trigger>
          <SelectV2.TriggerContent
            className={isError ? styles.errorTrigger : undefined}
            placeholder={placeholder}
          />
        </SelectV2.Trigger>
        <SelectV2.Menu>
          {options.map((option) => (
            <SelectV2.MenuItem key={option.value} option={option} />
          ))}
        </SelectV2.Menu>
      </SelectV2.Root>
    </div>
  );
}

export default SelectField;
