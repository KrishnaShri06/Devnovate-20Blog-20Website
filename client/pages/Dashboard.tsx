import { Layout } from "@/components/site/Layout";

export default function Dashboard() {
  return (
    <Layout>
      <section className="container py-16">
        <div className="mx-auto max-w-2xl rounded-xl border bg-card p-6">
          <h1 className="text-2xl font-bold">Your Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your submissions and published articles here. Implementation
            pending.
          </p>
        </div>
      </section>
    </Layout>
  );
}
