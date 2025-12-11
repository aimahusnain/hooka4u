"use client";
import { useState, useEffect } from "react";
import { Pencil, Loader2, DollarSign } from "lucide-react";
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

  // Fetch menu items
  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/menu-prices");
      if (!response.ok) {
        throw new Error("Failed to fetch menu items");
      }
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      toast.error("Failed to load menu items", {
        description: "Please try refreshing the page.",
      });
    } finally {
      setLoading(false);
    }
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
        description: "Please enter a valid price greater than or equal to 0.",
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`/api/menu-prices/${selectedItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price: priceValue,
          available: available,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update menu item");
      }

      await fetchMenuItems();
      handleCloseDialog();
      toast.success("Menu item updated!", {
        description: `${selectedItem.name} has been updated successfully.`,
      });
    } catch (error) {
      console.error("Error updating menu item:", error);
      toast.error("Failed to update menu item", {
        description: "Please try again later.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-zinc-950">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center gap-3 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3 px-3 sm:px-5 w-full">
          <SidebarTrigger className="hidden sm:flex -ml-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100" />
          <Separator orientation="vertical" className="h-4 bg-zinc-300 dark:bg-zinc-700" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink
                  href="#"
                  className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 text-sm"
                >
                  Menu Management
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block text-zinc-400 dark:text-zinc-600" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-zinc-900 dark:text-zinc-100 text-sm font-medium">
                  Menu Prices
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Menu Prices</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Update prices and availability for your menu items
            </p>
          </div>

          {/* Menu Items Table */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-lime-500 mb-4" />
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                Loading menu items...
              </p>
            </div>
          ) : menuItems.length === 0 ? (
            <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <DollarSign className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                    No menu items found
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Menu items will appear here once they are added to the
                    system
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800">
                        <th className="w-[35%] text-left px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">Item Name</th>
                        <th className="w-[35%] text-left px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 hidden sm:table-cell">
                          Description
                        </th>
                        <th className="w-[10%] text-center px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          Available
                        </th>
                        <th className="w-[15%] text-right px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          Price
                        </th>
                        <th className="w-[5%] text-right px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {menuItems.map((item) => (
                        <tr key={item.id} className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                          <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                            {item.name}
                          </td>
                          <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 hidden sm:table-cell">
                            {item.description || "—"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={item.available}
                                className="data-[state=checked]:bg-lime-600 data-[state=checked]:border-lime-600 border-zinc-400 dark:border-zinc-600"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-lime-600 dark:text-lime-400">
                            ${item.price.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-zinc-600 dark:text-zinc-400 hover:bg-lime-100 dark:hover:bg-lime-950/50 hover:text-lime-600 dark:hover:text-lime-400"
                              onClick={() => handleOpenDialog(item)}
                            >
                              <Pencil className="w-4 h-4" />
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

      {/* Edit Price Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-900 dark:text-zinc-100">Edit Menu Item</DialogTitle>
            <DialogDescription className="text-zinc-600 dark:text-zinc-400">
              Update the price and availability for {selectedItem?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="item-name" className="text-zinc-700 dark:text-zinc-300">Item Name</Label>
              <Input
                id="item-name"
                value={selectedItem?.name || ""}
                disabled
                className="bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
              />
            </div>
            {selectedItem?.description && (
              <div className="space-y-2">
                <Label htmlFor="item-description" className="text-zinc-700 dark:text-zinc-300">Description</Label>
                <Input
                  id="item-description"
                  value={selectedItem.description}
                  disabled
                  className="bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="price" className="text-zinc-700 dark:text-zinc-300">
                Price <span className="text-red-500 dark:text-red-400">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-500">
                  $
                </span>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="pl-7 bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                  autoFocus
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="available"
                  checked={available}
                  onCheckedChange={(checked) =>
                    setAvailable(checked as boolean)
                  }
                  className="data-[state=checked]:bg-lime-600 data-[state=checked]:border-lime-600 border-zinc-400 dark:border-zinc-600"
                />
                <Label
                  htmlFor="available"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-zinc-700 dark:text-zinc-300"
                >
                  Item is available for ordering
                </Label>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 ml-6">
                Uncheck to temporarily remove this item from the menu
              </p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Current Price:
                </span>
                <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  ${selectedItem?.price.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Current Status:
                </span>
                <span
                  className={`text-sm font-semibold ${
                    selectedItem?.available
                      ? "text-green-600 dark:text-green-500"
                      : "text-orange-600 dark:text-orange-500"
                  }`}
                >
                  {selectedItem?.available ? "Available" : "Unavailable"}
                </span>
              </div>
              {(price && !isNaN(parseFloat(price))) ||
              available !== selectedItem?.available ? (
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 space-y-2">
                  {price &&
                    !isNaN(parseFloat(price)) &&
                    parseFloat(price) !== selectedItem?.price && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                          New Price:
                        </span>
                        <span className="text-lg font-bold text-lime-600 dark:text-lime-400">
                          ${parseFloat(price).toFixed(2)}
                        </span>
                      </div>
                    )}
                  {available !== selectedItem?.available && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        New Status:
                      </span>
                      <span
                        className={`text-sm font-semibold ${
                          available ? "text-green-600 dark:text-green-500" : "text-orange-600 dark:text-orange-500"
                        }`}
                      >
                        {available ? "Available" : "Unavailable"}
                      </span>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseDialog}
              disabled={submitting}
              className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-lime-600 hover:bg-lime-700 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
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