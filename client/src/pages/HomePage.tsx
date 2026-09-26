import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "../lib/auth-client";

export function HomePage() {
  const { data: session } = useSession();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome, {session?.user.name}</CardTitle>
        <CardDescription>Tickets will appear here.</CardDescription>
      </CardHeader>
    </Card>
  );
}
