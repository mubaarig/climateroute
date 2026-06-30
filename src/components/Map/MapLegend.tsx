'use client';

const ITEMS = [
  { label: 'Selected route', className: 'bg-green-500', dashed: false },
  { label: 'Fastest route', className: 'bg-blue-500', dashed: true },
  { label: 'Alternative', className: 'bg-gray-400', dashed: false },
];

export default function MapLegend() {
  return (
    <div className="absolute bottom-4 left-4 z-[1000] rounded-lg bg-white/90 backdrop-blur px-3 py-2 shadow-md text-xs space-y-1.5">
      {ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-2 text-gray-600">
          <span
            className={`inline-block h-0.5 w-6 rounded ${item.className} ${
              item.dashed ? 'opacity-80 [border-top:2px_dashed] border-blue-500 bg-transparent' : ''
            }`}
            aria-hidden
          />
          {item.label}
        </div>
      ))}
    </div>
  );
}
