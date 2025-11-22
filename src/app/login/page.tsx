import { GalleryVerticalEnd } from "lucide-react";
import { LoginForm } from "@/components/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        {/* Login form */}
        <div className="flex flex-col flex-1 items-center justify-center">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md flex-col">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <b>Hooka4u</b>
          </a>

          <div className="w-full max-w-xs">
            <LoginForm />
            <div className="mt-4 text-center text-sm text-zinc-500">
              Having trouble logging in?{" "}
              <Link
                href="mailto:aimahusnain@gmail.com"
                className="text-primary underline"
                target="_blank"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden lg:flex items-center justify-center p-12 bg-black">
        <div className="max-w-lg space-y-8">
          <div className="h-1 w-12 bg-white"></div>
          <h2 className="text-4xl font-light text-white leading-tight tracking-tight">
            Streamlined ordering for your team
          </h2>
          <p className="text-zinc-400 text-base leading-relaxed font-light">
            Users can only log in using the credentials provided by the admin,
            after which they can browse items, select what they need, and place
            their orders easily.
          </p>
        </div>
      </div>
    </div>
  );
}
