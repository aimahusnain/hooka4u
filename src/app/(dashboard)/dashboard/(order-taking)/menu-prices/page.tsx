"use client";
import { useState, useEffect } from "react";
import { Pencil, Loader2, DollarSign, ChevronDown, ChevronUp } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  image?: string;
  available: boolean;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export default function MenuPrices() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [price, setPrice] = useState("");
  const [available, setAvailable] = useState(true);
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/menu-prices");
      if (!response.ok) throw new Error("Failed to fetch menu items");
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      toast.error("Failed to load menu items", {
        description: "Please try refreshing the page.",
      });
    } finally {
      setLoading(false);
    }
  };

  const sortByDescription = () => {
    setSortAsc(!sortAsc);
    setMenuItems((prev) =>
      [...prev].sort((a, b) => {
        const da = a.description || "";
        const db = b.description || "";
        return sortAsc ? da.localeCompare(db) : db.localeCompare(da);
      })
    );
  };

  const handleOpenDialog = (item: MenuItem) => {
    setSelectedItem(item);
    setPrice(item.price.toString());
    setAvailable(item.available);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedItem(null);
    setPrice("");
    setAvailable(true);
  };

  const handleSubmit = async () => {
    if (!selectedItem) return;

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue < 0) {
      toast.error("Invalid price", {
        description: "Enter a valid price ≥ 0.",
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`/api/menu-prices/${selectedItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: priceValue, available }),
      });

      if (!response.ok) throw new Error("Failed to update");

      await fetchMenuItems();
      handleCloseDialog();

      toast.success("Menu item updated!", {
        description: `${selectedItem.name} updated successfully.`,
      });
    } catch {
      toast.error("Failed to update item", {
        description: "Try again later.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-zinc-950">
      <header className="flex h-14 items-center gap-3 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3 px-3 sm:px-5 w-full">
          <SidebarTrigger className="hidden sm:flex -ml-1 text-zinc-600 dark:text-zinc-400" />
          <Separator orientation="vertical" className="h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink
                  href="/dashboard"
                  className="text-zinc-600 dark:text-zinc-400"
                >
                  Order Tracking
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium text-zinc-900 dark:text-zinc-100">
                  Menu Prices
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Menu Prices
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Update prices and availability
            </p>
          </div>

          {/* MENU TABLE */}
          {loading ? (
            <div className="flex flex-col items-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-lime-500" />
              <p className="text-sm mt-4">Loading...</p>
            </div>
          ) : menuItems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <DollarSign className="w-12 h-12 mx-auto text-zinc-500" />
                <h3 className="mt-4 font-semibold">No menu items found</h3>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        {/* Image FIRST */}
                        <th className="w-[12%] px-4 py-3 text-left">Image</th>

                        <th className="w-[22%] px-4 py-3 text-left">Item Name</th>

                        {/* DESCRIPTION sort in header */}
                        <th className="w-[30%] px-4 py-3 text-left hidden sm:table-cell">
                          <div className="flex items-center gap-2">
                            Description
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 h-6"
                              onClick={sortByDescription}
                            >
                              {sortAsc ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronUp className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </th>

                        <th className="w-[10%] text-center px-4 py-3">
                          Available
                        </th>
                        <th className="w-[15%] text-right px-4 py-3">Price</th>
                        <th className="w-[8%] text-right px-4 py-3">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {menuItems.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-zinc-50">
                          {/* IMAGE */}
                          <td className="px-4 py-3">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-10 h-10 rounded object-cover border"
                              />
                            ) : (
                              <span className="text-zinc-400">—</span>
                            )}
                          </td>

                          {/* NAME */}
                          <td className="px-4 py-3 font-medium">
                            {item.name}
                          </td>

                          {/* DESCRIPTION */}
                          <td className="px-4 py-3 hidden sm:table-cell">
                            {item.description || "—"}
                          </td>

                          {/* AVAILABLE */}
                          <td className="px-4 py-3 text-center">
                            <Checkbox checked={item.available} disabled />
                          </td>

                          {/* PRICE */}
                          <td className="px-4 py-3 text-right font-semibold text-lime-600">
                            ${item.price.toFixed(2)}
                          </td>

                          {/* ACTION */}
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* EDIT DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <DialogDescription>
              Update price & availability
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Item Name</Label>
              <Input value={selectedItem?.name || ""} disabled />
            </div>

            {selectedItem?.description && (
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={selectedItem.description} disabled />
              </div>
            )}

            <div>
              <Label>Price</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  className="pl-7"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <Checkbox
                checked={available}
                onCheckedChange={(v) => setAvailable(v as boolean)}
              />
              <Label>Available</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Updating…
                </>
              ) : (
                "Update Item"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
