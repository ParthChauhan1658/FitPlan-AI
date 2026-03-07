import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="w-full max-w-md">
      <SignUp
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
