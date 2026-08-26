import { UserProfile } from "@clerk/nextjs";

export default function UserProfilePage() {
  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <UserProfile />
    </div>
  );
}
