export const FlameIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2C12 2 8 6 8 10C8 14 10 16 12 16C14 16 16 14 16 10C16 6 12 2 12 2Z"
      fill="currentColor"
      className="text-orange-500"
    />
    <path
      d="M12 16C12 16 10 18 10 20C10 22 11 22 12 22C13 22 14 22 14 20C14 18 12 16 12 16Z"
      fill="currentColor"
      className="text-red-500"
    />
  </svg>
)

export const GrillIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="10" width="20" height="2" fill="currentColor" className="text-secondary" />
    <rect x="2" y="14" width="20" height="2" fill="currentColor" className="text-secondary" />
    <rect x="2" y="18" width="20" height="2" fill="currentColor" className="text-secondary" />
    <circle cx="6" cy="8" r="1" fill="currentColor" className="text-primary" />
    <circle cx="10" cy="6" r="1" fill="currentColor" className="text-primary" />
    <circle cx="14" cy="8" r="1" fill="currentColor" className="text-primary" />
    <circle cx="18" cy="6" r="1" fill="currentColor" className="text-primary" />
  </svg>
)

export const SkewerIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="4" y1="16" x2="28" y2="16" stroke="currentColor" strokeWidth="2" className="text-secondary" />
    <rect x="6" y="14" width="3" height="4" rx="1" fill="currentColor" className="text-red-600" />
    <rect x="11" y="13" width="3" height="6" rx="1" fill="currentColor" className="text-green-600" />
    <rect x="16" y="14" width="3" height="4" rx="1" fill="currentColor" className="text-red-600" />
    <rect x="21" y="13" width="3" height="6" rx="1" fill="currentColor" className="text-yellow-600" />
  </svg>
)

export const SmokeIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M6 20C6 20 4 18 4 16C4 14 6 14 6 16C6 14 8 14 8 16C8 18 6 20 6 20Z"
      fill="currentColor"
      className="text-muted-foreground opacity-60"
    />
    <path
      d="M12 18C12 18 10 16 10 14C10 12 12 12 12 14C12 12 14 12 14 14C14 16 12 18 12 18Z"
      fill="currentColor"
      className="text-muted-foreground opacity-40"
    />
    <path
      d="M18 16C18 16 16 14 16 12C16 10 18 10 18 12C18 10 20 10 20 12C20 14 18 16 18 16Z"
      fill="currentColor"
      className="text-muted-foreground opacity-30"
    />
  </svg>
)
