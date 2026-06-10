import type { Metadata } from "next";
import { LoginForm } from "@/components/LoginForm";
import { SunWave } from "@/components/Brand";

export const metadata: Metadata = { title: "Board sign-in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20">
      <SunWave className="h-12 w-12" />
      <h1 className="mt-4 text-2xl font-extrabold text-navy">Board sign-in</h1>
      <p className="mt-2 text-center text-sm text-muted">
        For Committee on Committees board members and BCU chairs. Students
        don&apos;t need an account to apply.
      </p>
      <div className="mt-8 w-full">
        <LoginForm next={next ?? "/admin"} />
      </div>
    </div>
  );
}
