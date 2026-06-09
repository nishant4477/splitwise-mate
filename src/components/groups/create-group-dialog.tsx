"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createGroup } from "@/app/actions/group";

export function CreateGroupDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const currency = formData.get("currency") as string;

    try {
      const group = await createGroup({ name, description, currency });
      setOpen(false);
      router.push(`/groups/${group.id}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      // You could add toast notification here
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        asChild
      >
          <button
            className="shimmer-btn flex items-center justify-center gap-2 bg-gradient-to-r from-[#eae151] to-[#ffd60a] text-black px-4 py-2 rounded-xl font-bold hover:shadow-lg hover:shadow-[#ffd60a]/25 transition-all active:scale-[0.98] text-sm"
          >
        <Plus className="w-4 h-4" />
        Create Group
      </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#09090b] border-white/[0.08] text-white">
        <DialogHeader>
          <DialogTitle>Create a new group</DialogTitle>
          <DialogDescription className="text-neutral-400">
            Create a group for your apartment, trip, or event to start splitting expenses.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name</Label>
            <Input 
              id="name" 
              name="name" 
              required 
              placeholder="e.g. Goa Trip 2026" 
              className="bg-white/[0.04] border-white/[0.08]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input 
              id="description" 
              name="description" 
              placeholder="e.g. Expenses for our summer trip" 
              className="bg-white/[0.04] border-white/[0.08]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input 
              id="currency" 
              name="currency" 
              defaultValue="INR" 
              placeholder="INR, USD, EUR, etc." 
              className="bg-white/[0.04] border-white/[0.08]"
            />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-white/[0.08] hover:bg-white/[0.04]">
              Cancel
            </Button>
            <button type="submit" disabled={loading} className="bg-gradient-to-r from-[#eae151] to-[#ffd60a] text-black px-4 py-2 rounded-md font-bold hover:opacity-90 disabled:opacity-50 transition-all text-sm">
              {loading ? "Creating..." : "Create Group"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
