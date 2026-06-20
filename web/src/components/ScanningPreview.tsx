interface ScanningPreviewProps {
  previewUrl: string;
}

/**
 * Shown while the real proofing request is in flight. The sweeping line is a
 * pure CSS animation tied to the genuine pending state — it conveys "working",
 * it does not gate or delay the result. The moment the request resolves, the
 * parent swaps this out.
 */
export function ScanningPreview({ previewUrl }: ScanningPreviewProps) {
  return (
    <div className="space-y-5">
      <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-chunky border border-ink/10 bg-[conic-gradient(#0000_90deg,#00000008_0)_0_0/24px_24px]">
        <img src={previewUrl} alt="Artwork being analyzed" className="h-full w-full object-contain" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 animate-scan-sweep bg-gradient-to-b from-mule-500/0 via-mule-500/30 to-mule-500/0" />
      </div>
      <div className="flex items-center justify-center gap-3 text-sm font-medium text-ink/70">
        <span className="h-2 w-2 animate-pulse rounded-full bg-mule-500" />
        Running pre-flight checks with GPT-4o Vision…
      </div>
    </div>
  );
}
