type AdType =
  | '468x60'
  | '300x250'
  | '160x300'
  | '160x600'
  | '320x50'
  | '728x90';

interface AdSlotProps {
  type: AdType;
}

const dimensions: Record<AdType, { width: number; height: number }> = {
  '468x60': { width: 468, height: 60 },
  '300x250': { width: 300, height: 250 },
  '160x300': { width: 160, height: 300 },
  '160x600': { width: 160, height: 600 },
  '320x50': { width: 320, height: 50 },
  '728x90': { width: 728, height: 90 },
};

// Adsterra (highperformanceformat) banner keys per size.
const adsterraKeys: Partial<Record<AdType, string>> = {
  '160x600': '10820618eba123771f9b5eac419f62b3',
  '728x90': 'b210e9e99287a30498a0593427c71365',
  '320x50': 'a1ecf7d0536465453acc5fdbca74be38',
  '300x250': '79070882c50d9f6bc4043b4b33275b1a',
};

/**
 * Builds a self-contained HTML document for one Adsterra banner. Each ad sets a
 * global `atOptions`, so they MUST live in separate iframes to avoid clobbering
 * each other when several appear on the same page.
 */
function adDocument(key: string, width: number, height: number): string {
  return `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style></head><body><script type="text/javascript">atOptions={'key':'${key}','format':'iframe','height':${height},'width':${width},'params':{}};</script><script type="text/javascript" src="https://www.highperformanceformat.com/${key}/invoke.js"></script></body></html>`;
}

export function AdSlot({ type }: AdSlotProps) {
  const { width, height } = dimensions[type];
  const key = adsterraKeys[type];

  // No key configured for this size — render a dashed placeholder.
  if (!key) {
    return (
      <div
        style={{ width, height, maxWidth: '100%' }}
        className="relative mx-auto flex items-center justify-center overflow-hidden rounded-lg border border-dashed border-line bg-fill select-none"
      >
        {/* PASTE ADSTERRA SCRIPT FOR {type} HERE */}
      </div>
    );
  }

  return (
    <iframe
      title={`ad-${type}`}
      width={width}
      height={height}
      style={{ width, height, maxWidth: '100%', border: 0, display: 'block' }}
      scrolling="no"
      loading="lazy"
      srcDoc={adDocument(key, width, height)}
    />
  );
}
