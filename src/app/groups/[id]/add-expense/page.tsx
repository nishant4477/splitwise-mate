import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getGroupDetails } from "@/app/actions/group";
import AddExpenseForm from "@/components/expenses/add-expense-form";

export default async function AddExpensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = await params;
  const group = await getGroupDetails(id);

  if (!group) {
    redirect("/dashboard");
  }

  return (
    <AddExpenseForm
      groupId={group.id}
      groupName={group.name}
      currency={group.currency}
      members={group.members}
      currentUserId={session.user.id}
    />
  );
}
