import { Layout } from "@/components/site/Layout";

export default function Signup() {
  return (
    <Layout>
      <section className="container py-16">
        <div className="mx-auto max-w-md rounded-xl border bg-card p-6">
          <h1 className="text-2xl font-bold">Sign up</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your Devnovate account. Full auth flow coming next.
          </p>
        </div>
      </section>
    </Layout>
  );
}
