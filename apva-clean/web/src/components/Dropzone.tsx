import { useCallback, useRef, useState } from "react";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024;

interface DropzoneProps {
  onFileAccepted: (file: File) => void;
  disabled: boolean;
}

function validate(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "That file type isn't supported. Use a PNG, JPEG, or WebP.";
  }
  if (file.size > MAX_BYTES) {
    return "That image is over the 10 MB limit. Try a smaller export.";
  }
  return null;
}

export function Dropzone({ onFileAccepted, disabled }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      const problem = validate(file);
      if (problem) {
        setLocalError(problem);
        return;
      }
      setLocalError(null);
      onFileAccepted(file);
    },
    [onFileAccepted],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLButtonElement>) => {
      event.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      accept(event.dataTransfer.files[0]);
    },
    [accept, disabled],
  );

  return (
    <div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        aria-label="Upload artwork to proof"
        className={`group flex w-full flex-col items-center justify-center gap-4 rounded-chunky border-2 border-dashed px-8 py-16 text-center transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-mule-100 disabled:cursor-not-allowed disabled:opacity-60 ${
          isDragging
            ? "border-mule-500 bg-mule-50 scale-[1.01]"
            : "border-ink/15 bg-white hover:border-mule-400 hover:bg-mule-50/40"
        }`}
      >
        <span
          className={`flex h-16 w-16 items-center justify-center rounded-2xl text-2xl transition-colors ${
            isDragging ? "bg-mule-500 text-white" : "bg-mule-50 text-mule-500 group-hover:bg-mule-100"
          }`}
          aria-hidden="true"
        >
          ↑
        </span>
        <span className="space-y-1">
          <span className="block font-display text-lg font-bold text-ink">
            Drop your sticker artwork here
          </span>
          <span className="block text-sm text-ink/55">PNG, JPEG, or WebP, up to 10 MB</span>
        </span>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={(event) => accept(event.target.files?.[0])}
        />
      </button>
      {localError && (
        <p role="alert" className="mt-3 text-sm font-medium text-clay">
          {localError}
        </p>
      )}
    </div>
  );
}
