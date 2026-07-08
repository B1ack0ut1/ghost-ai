import { SignUp } from "@clerk/nextjs";
import { FileText, ShieldCheck, Users } from "lucide-react";

import { AuthPageShell } from "@/components/auth/auth-page-shell";

const signInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/sign-in";
const signUpUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? "/sign-up";

export default function SignUpPage() {
  return (
    <AuthPageShell
      tagline="Create your Ghost AI workspace."
      description="Start with a secure account, then build system designs with shared project context."
      features={[
        {
          description:
            "Create and access architecture projects through your protected account.",
          icon: ShieldCheck,
          title: "Private architecture projects",
        },
        {
          description:
            "Invite collaborators into a workspace that understands identity.",
          icon: Users,
          title: "Identity-aware collaboration",
        },
        {
          description:
            "Turn refined canvas graphs into durable Markdown technical specs.",
          icon: FileText,
          title: "Generated technical specs",
        },
      ]}
    >
      <SignUp path={signUpUrl} routing="path" signInUrl={signInUrl} />
    </AuthPageShell>
  );
}
