import { type NextPage } from "next";
import { UserProfile, SignedIn, SignedOut } from "@clerk/clerk-react";
import { PageLayout } from "~/components/PageLayout";

const ProfileSettings: NextPage = () => {
  return (
    <PageLayout pageName="Settings">
      <SignedIn>
        <div className="h-full w-full">
          <UserProfile
            path="/profileSettings"
            appearance={{
              elements: {
                rootBox: "h-full w-full flex items-center justify-center",
                navbar: {
                  display: "none",
                },
              },
            }}
          />
        </div>
      </SignedIn>
      <SignedOut>Error!</SignedOut>
    </PageLayout>
  );
};

export default ProfileSettings;
