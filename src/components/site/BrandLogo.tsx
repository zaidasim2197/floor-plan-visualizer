export function BrandLogo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <div className="relative inline-flex items-center justify-center shrink-0">
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="Marriott Expo Logo"
      >
        <rect width="40" height="40" rx="9" fill="#153e2d" />
        <rect x="1" y="1" width="38" height="38" rx="8" stroke="#2b6b4f" strokeWidth="1" />
        <rect x="9" y="9" width="9" height="9" rx="2.5" fill="#d9a75c" />
        <rect x="22" y="9" width="9" height="9" rx="2.5" fill="#f4efe6" />
        <rect x="9" y="22" width="9" height="9" rx="2.5" fill="#f4efe6" />
        <rect x="22" y="22" width="9" height="9" rx="2.5" fill="#194836" stroke="#d9a75c" strokeWidth="1.5" />
        <circle cx="20" cy="20" r="1.75" fill="#d9a75c" />
      </svg>
    </div>
  );
}
