import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-900 to-purple-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gold-primary mb-2">
            Welcome
          </h1>
          <p className="text-gold-secondary">
            Sign in to continue your journey
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 shadow-gold">
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary:
                  "bg-gold-primary hover:bg-gold-secondary text-purple-900 font-bold",
                card: "bg-transparent shadow-none",
                headerTitle: "text-gold-primary",
                headerSubtitle: "text-gold-secondary",
                socialButtonsBlockButton:
                  "border border-gold-primary text-gold-primary hover:bg-gold-primary/10",
                formFieldLabel: "text-gold-secondary",
                formFieldInput:
                  "bg-white/5 border-gold-primary/50 text-white focus:border-gold-primary",
                footerActionLink: "text-gold-primary hover:text-gold-secondary",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
