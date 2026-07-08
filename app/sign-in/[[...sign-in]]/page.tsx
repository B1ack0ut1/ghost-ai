import { SignIn } from "@clerk/nextjs";
import { Bot, FileText, Share2 } from "lucide-react";

import { AuthPageShell } from "@/components/auth/auth-page-shell";

const signInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/sign-in";
const signUpUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? "/sign-up";

export default function SignInPage() {
  return (
    <AuthPageShell
      tagline="Design systems at the speed of thought."
      description="Describe your architecture in plain English. Ghost AI maps it to a shared canvas your whole team can refine in real time."
      features={[
        {
          description:
            "Describe your system, AI maps it to nodes and edges on a live canvas.",
          icon: Bot,
          title: "AI Architecture Generation",
        },
        {
          description:
            "Live cursors, presence indicators, and shared node editing across your team.",
          icon: Share2,
          title: "Real-time Collaboration",
        },
        {
          description:
            "Export a complete Markdown technical spec directly from the canvas graph.",
          icon: FileText,
          title: "Instant Spec Generation",
        },
      ]}
    >
      <SignIn path={signInUrl} routing="path" signUpUrl={signUpUrl} />
    </AuthPageShell>
  );
}
