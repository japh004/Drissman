import { redirect } from "next/navigation";

// Root page simply redirects to the public landing page
export default function RootPage() {
    redirect("/");
}
