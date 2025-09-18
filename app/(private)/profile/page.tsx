"use client"

import { BranchesCard } from "@/components/profile/branches-card"
import { PersonalInfoCard } from "@/components/profile/personal-info-card"
import { ProfileHeader } from "@/components/profile/profile-header"
import { RecentActivityCard } from "@/components/profile/recent-activity-card"
import { useAppSelector } from "@/lib/hooks/app-selector"
import { selectPermissions, selectUser } from "@/lib/features/auth/auth-slice"


export default function ProfilePage() {
  const user = useAppSelector(selectUser);
  const permissions = useAppSelector(selectPermissions);

  if (!user || !permissions) {
    return <div>Loading...</div>;
  }

  const userData = user;

  return (
    <>
      <ProfileHeader name={userData.nome_completo} role={userData.nome_funcao ?? ""} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <PersonalInfoCard email={userData.email} isActive={userData.ativo} />
            <BranchesCard role={userData.nome_funcao ?? ""} branches={permissions?.filiais} />
          </div>

          <div className="lg:col-span-1">
            <RecentActivityCard />
          </div>
        </div>
      </div>
    </>
  )
}
