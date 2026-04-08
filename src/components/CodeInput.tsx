import { useId, useRef, useState } from 'react';
import * as styles from './CodeInput.css';

export const SPRINT_CODE_LENGTH = 6;

const DEFAULT_ERROR_MESSAGE = '잘못된 코드입니다. 코드를 다시 입력해주세요.';

export interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  showError?: boolean;
  errorMessage?: string;
}

function CodeInput({
  value,
  onChange,
  showError = false,
  errorMessage = DEFAULT_ERROR_MESSAGE,
}: CodeInputProps) {
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const labelId = useId();
  const errorId = useId();

  const handleChange = (next: string) => {
    const sanitized = next.replace(/\D/g, '').slice(0, SPRINT_CODE_LENGTH);
    onChange(sanitized);
  };

  const activeBoxIndex = isInputFocused
    ? Math.min(value.length, SPRINT_CODE_LENGTH - 1)
    : -1;

  return (
    <div className={styles.root}>
      <div className={styles.fieldLabel} id={labelId}>
        <span className={styles.fieldLabelText}>코드를 입력하세요</span>
        <span className={styles.fieldLabelRequired} aria-hidden>
          *
        </span>
      </div>

      <div
        className={styles.codeField}
        onClick={() => inputRef.current?.focus()}
        role="group"
        aria-labelledby={labelId}
      >
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={SPRINT_CODE_LENGTH}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          className={styles.hiddenInput}
          aria-label="스프린트 코드 6자리"
          aria-describedby={showError ? errorId : undefined}
          aria-invalid={showError}
        />
        <div className={styles.codeBoxes} aria-hidden>
          {Array.from({ length: SPRINT_CODE_LENGTH }, (_, i) => {
            const digit = value[i];
            const isActive = activeBoxIndex === i;
            const isFilled = Boolean(digit);
            return (
              <div
                key={i}
                className={styles.codeBox}
                data-active={isActive}
                data-filled={isFilled}
              >
                <span className={styles.codeDigit}>
                  {digit ?? ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {showError && (
        <p
          id={errorId}
          className={styles.errorText}
          role="alert"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}

export default CodeInput;
