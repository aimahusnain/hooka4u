"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, Loader2, Upload, X, Image } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export default function MenuItemsPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Fetch menu items
  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/menu-items/get-all-items");
      
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Invalid file type", {
        description: "Please select an image file.",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Please select an image smaller than 5MB.",
      });
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenDialog = (item?: MenuItem) => {
    if (item) {
      setSelectedItem(item);
      setFormData({
        name: item.name,
        description: item.description || "",
      });
      setImagePreview(item.image || null);
    } else {
      setSelectedItem(null);
      setFormData({
        name: "",
        description: "",
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedItem(null);
    setFormData({
      name: "",
      description: "",
    });
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Name is required", {
        description: "Please enter a name for the menu item.",
      });
      return;
    }

    try {
      setSubmitting(true);
      
      let imageBase64 = selectedItem?.image || null;
      
      // Convert new image to base64 if uploaded
      if (imageFile) {
        imageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
      } else if (imagePreview === null && selectedItem) {
        // Image was removed
        imageBase64 = null;
      }
      
      const url = selectedItem 
        ? `/api/menu-items/${selectedItem.id}`
        : "/api/menu-items";
      
      const method = selectedItem ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          price: 0,
          image: imageBase64,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${selectedItem ? "update" : "create"} menu item`);
      }

      await fetchMenuItems();
      handleCloseDialog();
      
      toast.success(
        selectedItem ? "Menu item updated!" : "Menu item created!",
        {
          description: selectedItem 
            ? "The menu item has been successfully updated."
            : "The menu item has been successfully created.",
        }
      );
    } catch (error) {
      console.error("Error saving menu item:", error);
      toast.error("Failed to save menu item", {
        description: "Please try again later.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (item: MenuItem) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      setSubmitting(true);
      
      const response = await fetch(`/api/menu-items/${itemToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete menu item");
      }

      await fetchMenuItems();
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
      
      toast.success("Menu item deleted!", {
        description: "The menu item has been successfully removed.",
      });
    } catch (error) {
      console.error("Error deleting menu item:", error);
      toast.error("Failed to delete menu item", {
        description: "Please try again later.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center gap-3 bg-card border-b border-border">
        <div className="flex items-center gap-3 px-3 sm:px-5 w-full">
          <SidebarTrigger className="-ml-1 hidden sm:flex" />
          <Separator orientation="vertical" className="h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink
                  href="#"
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  Menu Management
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-foreground text-sm font-medium">
                  Menu Items
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Menu Items</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your menu items. Note: All new items will have a price of $0.00 by default.
              </p>
            </div>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Menu Item
            </Button>
          </div>

          {/* Menu Items Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground text-sm">Loading menu items...</p>
            </div>
          ) : menuItems.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No menu items yet
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get started by creating your first menu item
                  </p>
                  <Button
                    onClick={() => handleOpenDialog()}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Menu Item
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {menuItems.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow overflow-hidden">
                  {item.image && (
                    <div className="w-full h-64 bg-muted relative overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-64 aspect-square"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-semibold truncate">
                          {item.name}
                        </CardTitle>
                        <p className="text-2xl font-bold text-primary mt-1">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                          onClick={() => handleOpenDialog(item)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDeleteClick(item)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {item.description && (
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? "Edit Menu Item" : "Add New Menu Item"}
            </DialogTitle>
            <DialogDescription>
              {selectedItem 
                ? "Update the details of the menu item below."
                : "Create a new menu item. The price will be set to $0.00 and can be updated later."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Image (Optional)</Label>
              <div className="space-y-3">
                {imagePreview ? (
                  <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden border-2 border-border">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={handleRemoveImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="w-full h-48 bg-muted rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer flex flex-col items-center justify-center"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Image className="w-12 h-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">Click to upload image</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                {!imagePreview && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Image
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Cappuccino, Caesar Salad"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Enter a brief description of the item..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="bg-muted/50 border border-border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Price</span>
                <span className="text-lg font-bold text-primary">$0.00</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Price is set to $0.00 by default and will be updated later by users.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseDialog}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {selectedItem ? "Updating..." : "Creating..."}
                </>
              ) : (
                selectedItem ? "Update Item" : "Create Item"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &qout;{itemToDelete?.name}&qout;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={submitting}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}