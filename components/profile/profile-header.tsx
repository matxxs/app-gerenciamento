import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ProfileHeaderProps {
  name: string
  role: string
}

export function ProfileHeader({ name, role }: ProfileHeaderProps) {
  return (
    <div className="relative">
      {/* Banner Background */}
      <div
        className="h-64 w-full bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 relative overflow-hidden"
        style={{
          backgroundImage: `url('/banner.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Profile Information */}
      <div className="container mx-auto px-4">
        <div className="relative -mt-20 flex items-end gap-6">
          {/* Avatar */}
          <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
            <AvatarImage src="/professional-woman-avatar.png" alt={name} />
            <AvatarFallback className="text-2xl font-semibold bg-primary text-primary-foreground">
              {name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>

          {/* Name and Role */}
          <div className="pb-4 text-white">
            <h1 className="text-3xl font-bold text-balance mb-2">{name}</h1>
            <p className="text-lg text-white/90">{role}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
