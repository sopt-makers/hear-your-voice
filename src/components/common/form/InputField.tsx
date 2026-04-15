import type { ChangeEvent } from 'react';
import { TextField } from '@sopt-makers/ui';

interface InputFieldProps {
  labelText: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

function InputField({
  labelText,
  required = false,
  placeholder,
  value,
  onChange,
}: InputFieldProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <TextField
      labelText={labelText}
      required={required}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
    />
  );
}

export default InputField;
