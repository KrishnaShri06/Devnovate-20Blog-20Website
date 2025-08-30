import { Layout } from "@/components/site/Layout";

export default function Login() {
  return (
    <Layout>
      <section className="container py-16">
        <div className="mx-auto max-w-md rounded-xl border bg-card p-6">
          <h1 className="text-2xl font-bold">Log in</h1>
          <p className="mt-2 text-sm text-muted-foreground">Authentication UI to be implemented next. Use this page to access your dashboard.</p>
        </div>
      </section>
    </Layout>
  );
}
