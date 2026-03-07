import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="w-full max-w-md">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto w-full",
            card: "shadow-lg",
          },
        }}
      />
    </div>
  );
}
