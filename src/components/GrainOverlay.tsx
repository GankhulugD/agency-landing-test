export function GrainOverlay() {
  return (
    <>
      <div
        className="grain-overlay pointer-events-none fixed inset-0 z-[150]"
        aria-hidden
      />
      <div
        className="vignette-overlay pointer-events-none fixed inset-0 z-[149]"
        aria-hidden
      />
    </>
  );
}
