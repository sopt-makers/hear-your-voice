import type { ChangeEvent } from 'react';
import { TextArea, TopAddon, FieldBoxLabel } from '@sopt-makers/ui';

interface TextAreaFieldProps {
  labelText: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

function TextAreaField({
  labelText,
  required = false,
  placeholder,
  value,
  onChange,
}: TextAreaFieldProps) {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <TextArea
      topAddon={<TopAddon leftAddon={<FieldBoxLabel label={labelText} required={required} />} />}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
    />
  );
}

export default TextAreaField;
