"use client";

import { useState, useEffect } from "react";
import { Plus, Minus, ShoppingCart, X, Loader2, ChevronUp, ArrowLeft } from 'lucide-react';
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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { EmptyHookahState } from "@/components/empty-hookah-state";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  [key: string]: CartItem;
}

export default function NewOrder() {
  const [customerName, setCustomerName] = useState("");
  const [paymentType, setPaymentType] = useState<"CASH" | "CARD">("CASH");
  const [seating, setSeating] = useState("");
  const [cart, setCart] = useState<CartState>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  // <CHANGE> Added state for mobile sheet drawer
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [mobileSheetView, setMobileSheetView] = useState<"cart" | "form">("cart");

  // Fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/menu-items");

        if (!response.ok) {
          throw new Error("Failed to fetch menu items");
        }

        const json = await response.json();
        const data: Product[] = Array.isArray(json) ? (json as Product[]) : [];
        setProducts(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load products"
        );
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const addToCart = (product: Product) => {
    setCart((prev) => ({
      ...prev,
      [product.id]: {
        ...product,
        quantity: (prev[product.id]?.quantity || 0) + 1,
      },
    }));
  };

  const updateQuantity = (productId: string, change: number) => {
    setCart((prev) => {
      const currentQty = prev[productId]?.quantity || 0;
      const newQty = currentQty + change;

      if (newQty <= 0) {
        const { [productId]: removed, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [productId]: {
          ...prev[productId],
          quantity: newQty,
        },
      };
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const { [productId]: removed, ...rest } = prev;
      return rest;
    });
  };

  const handleProductClick = (product: Product) => {
    const inCart = cart[product.id];
    if (inCart && inCart.quantity === 1) {
      removeFromCart(product.id);
    } else {
      addToCart(product);
    }
  };

  const handlePlaceOrderClick = () => {
    if (cartItems.length === 0) return;
    setShowOrderForm(true);
  };

  // <CHANGE> Added handlers for mobile sheet
  const handleMobileOrderButton = () => {
    setIsMobileSheetOpen(true);
    setMobileSheetView("cart");
  };

  const handleMobileSheetPlaceOrder = () => {
    if (cartItems.length === 0) return;
    setMobileSheetView("form");
  };

  const handleMobileSheetBackToCart = () => {
    setMobileSheetView("cart");
  };

  const handleBackToCart = () => {
    setShowOrderForm(false);
  };

  const handleConfirmOrder = async () => {
    if (!customerName.trim()) {
      toast.info("Customer name is required", {
        description: "Please enter a customer name before placing the order.",
        action: {
          label: "Close",
          onClick: () => console.log("Toast Closed"),
        },
      });
      return;
    }

    if (!seating.trim()) {
      toast.info("Seating Location is required", {
        description: "Please enter a seating location before placing the order.",
        action: {
          label: "Close",
          onClick: () => console.log("Toast Closed"),
        },
      });
      return;
    }

    try {
      setSubmitting(true);
      const orderData = {
        customerName: customerName.trim(),
        paymentType,
        seating: seating.trim() || null,
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        subtotal,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error("Failed to place order");
      }

      const order = await response.json();

      setCart({});
      setCustomerName("");
      setPaymentType("CASH");
      setSeating("");
      setShowOrderForm(false);
      setIsCartOpen(false);
      // <CHANGE> Close mobile sheet after successful order
      setIsMobileSheetOpen(false);
      setMobileSheetView("cart");

      toast.success("Order has been successfully placed!", {
        // @ts-ignore
        description: "Order ID: " + order.id,
        action: {
          label: "Close",
          onClick: () => console.log("Toast Closed"),
        },
      });
    } catch (err) {
      console.error("Error placing order:", err);
      toast.error("We are sorry to say, but your order cannot be placed", {
        description: "Please try again later!",
        action: {
          label: "Close",
          onClick: () => console.log("Toast Closed"),
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  const cartItems = Object.values(cart);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex flex-col h-screen bg-background">

      {/* Main Content */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Products Section */}
        {/* <CHANGE> Added bg-zinc-50 for mobile background color and increased bottom padding for mobile button */}
        <div className="flex-1 flex flex-col overflow-hidden pb-20 md:pb-0 bg-zinc-50 md:bg-background">
          <div className="flex-1 overflow-y-auto p-3 sm:p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground text-sm">
                  Loading menu items...
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-destructive text-sm font-medium mb-2">
                  Error loading products
                </div>
                <p className="text-muted-foreground text-xs">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  // @ts-ignore
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <EmptyHookahState />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {products.map((product) => {
                  const inCart = cart[product.id];
                  const isSelected = inCart && inCart.quantity > 0;

                  return (
                    <Card
                      key={product.id}
                      className={`cursor-pointer transition-all border ${
                        isSelected
                          ? "bg-lime-100 shadow-md"
                          : "border-border/10 bg-card hover:border-primary/50 hover:shadow-sm"
                      }`}
                      onClick={() => handleProductClick(product)}
                    >
                      <CardContent className="px-3 sm:px-4 space-y-2 sm:space-y-3">
                        <div>
                          <h3 className="font-semibold text-xs sm:text-sm text-foreground leading-snug">
                            {product.name}
                          </h3>
                          {product.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {product.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="font-semibold text-sm sm:text-base text-foreground">
                            ${product.price.toFixed(2)}
                          </span>
                          {isSelected && (
                            <Badge className="bg-primary hover:bg-primary text-primary-foreground px-2 py-0.5 text-xs font-medium">
                              {inCart.quantity}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Bottom Button - Fixed Position */}
        {/* <CHANGE> Added fixed bottom button for mobile that opens the sheet */}
        {totalItems > 0 && (
          <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-border p-4 shadow-lg">
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-semibold rounded-lg"
              onClick={handleMobileOrderButton}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Place Order ({totalItems})
            </Button>
          </div>
        )}

        {/* Mobile Sheet Overlay */}
        {/* <CHANGE> Added mobile sheet overlay with black theme */}
        {isMobileSheetOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileSheetOpen(false)}
          />
        )}

        {/* Mobile Sheet Drawer */}
        {/* <CHANGE> Added animated sheet drawer from right side with dark theme */}
<div
          className={`fixed right-0 top-0 bottom-0 w-full max-w-md bg-zinc-950 text-white shadow-2xl z-50 md:hidden transition-transform duration-300 ease-out flex flex-col ${
            isMobileSheetOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Sheet Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              {mobileSheetView === "form" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 -ml-2 hover:bg-zinc-800 text-white"
                  onClick={handleMobileSheetBackToCart}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <ShoppingCart className="w-5 h-5 text-lime-500" />
              {mobileSheetView === "cart" ? "Current Order" : "Order Details"}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-zinc-800 text-white"
              onClick={() => setIsMobileSheetOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Sheet Content */}
          {mobileSheetView === "cart" ? (
            <>
              {/* Cart Items View */}
              <div className="flex-1 overflow-y-auto p-4">
             {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                    <ShoppingCart className="w-12 h-12 mb-3 opacity-50" />
                    <p className="font-medium text-sm">No items yet</p>
                    <p className="text-xs text-center mt-1 text-zinc-500">
                      Select products to start
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-zinc-800 rounded-lg p-3.5 border border-zinc-700 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-white truncate">
                              {item.name}
                            </h4>
                            <p className="text-xs text-zinc-400 mt-0.5">
                              ${item.price.toFixed(2)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 -mt-1 -mr-1 hover:bg-red-500/20 hover:text-red-400 text-zinc-400 transition-colors"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 border-zinc-700 hover:bg-zinc-700 bg-transparent text-white hover:text-white"
                              onClick={() => updateQuantity(item.id, -1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-6 text-center font-semibold text-sm text-white">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 border-zinc-700 hover:bg-zinc-700 bg-transparent text-white hover:text-white"
                              onClick={() => updateQuantity(item.id, 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <span className="font-semibold text-sm text-lime-500">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Footer */}
              <div className="border-t border-zinc-800 bg-zinc-900 p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-white">Total</span>
                  <span className="text-xl font-bold text-lime-500">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <Button
                  className="w-full bg-lime-600 hover:bg-lime-700 text-white h-10 text-sm font-medium transition-colors"
                  disabled={cartItems.length === 0}
                  onClick={handleMobileSheetPlaceOrder}
                >
                  Continue to Order
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Order Form View */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName" className="text-sm font-medium text-white">
                    Customer Name *
                  </Label>
                  <Input
                    id="customerName"
                    placeholder="Enter customer name"
                    value={customerName}
                    // @ts-ignore
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="h-9 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white">Payment Type *</Label>
                  <RadioGroup value={paymentType} onValueChange={(value) => setPaymentType(value as "CASH" | "CARD")}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="CASH" id="cash" className="border-zinc-600 text-lime-500" />
                      <Label htmlFor="cash" className="text-sm font-normal cursor-pointer text-white">
                        Cash
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="CARD" id="card" className="border-zinc-600 text-lime-500" />
                      <Label htmlFor="card" className="text-sm font-normal cursor-pointer text-white">
                        Credit Card
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seating" className="text-sm font-medium text-white">
                    Seating Location *
                  </Label>
                  <Input
                    id="seating"
                    placeholder="e.g., Table 5, Booth 2"
                    value={seating}
                    // @ts-ignore
                    onChange={(e) => setSeating(e.target.value)}
                    className="h-9 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 text-sm"
                  />
                </div>

                {/* Order Summary */}
                <div className="pt-4 border-t border-zinc-700">
                  <h3 className="text-sm font-semibold text-white mb-3">Order Summary</h3>
                  <div className="space-y-2">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-zinc-400">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-medium text-lime-500">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Footer */}
              <div className="border-t border-zinc-800 bg-zinc-900 p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-white">Total</span>
                  <span className="text-xl font-bold text-lime-500">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <Button
                  className="w-full bg-lime-600 hover:bg-lime-700 text-white h-10 text-sm font-medium transition-colors disabled:opacity-50"
                  disabled={submitting}
                  onClick={handleConfirmOrder}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Confirm Order"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Desktop Sidebar - Hidden on Mobile */}
        <div className="hidden md:flex w-96 lg:w-[400px] bg-card border-l border-border flex-col">
          {/* Cart Header */}
          <div className="px-6 py-4 border-b border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2.5">
                {showOrderForm && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 -ml-2"
                    onClick={handleBackToCart}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                )}
                <ShoppingCart className="w-5 h-5 text-primary" />
                {showOrderForm ? "Order Details" : "Current Order"}
              </h2>
              {!showOrderForm && totalItems > 0 && (
                <Badge className="bg-primary hover:bg-primary text-primary-foreground px-2.5 py-0.5 text-xs font-medium">
                  {totalItems}
                </Badge>
              )}
            </div>
          </div>

          {/* Conditional Content - Cart Items or Order Form */}
          {!showOrderForm ? (
            <>
              {/* Cart Items - Scrollable */}
              <div className="flex-1 overflow-y-auto">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full px-6 text-muted-foreground">
                    <ShoppingCart className="w-14 h-14 mb-3 opacity-30" />
                    <p className="font-medium text-muted-foreground text-sm">
                      No items yet
                    </p>
                    <p className="text-xs text-center mt-1 text-muted-foreground/80">
                      Select products to start
                    </p>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-muted/40 rounded-lg p-3.5 border border-border transition-all hover:border-primary/50"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-foreground truncate">
                              {item.name}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              ${item.price.toFixed(2)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 -mt-1 -mr-1 hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 border-border hover:bg-muted bg-transparent"
                              onClick={() => updateQuantity(item.id, -1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-6 text-center font-semibold text-sm text-foreground">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 border-border hover:bg-muted bg-transparent"
                              onClick={() => updateQuantity(item.id, 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <span className="font-semibold text-sm text-foreground">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-border bg-card">
                <div className="px-6 py-5 space-y-4">
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-sm font-semibold text-foreground">
                      Total
                    </span>
                    <span className="text-xl font-bold text-primary">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 text-sm font-medium transition-colors"
                    disabled={cartItems.length === 0}
                    onClick={handlePlaceOrderClick}
                  >
                    Place Order
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Order Form */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName" className="text-sm font-medium">
                    Customer Name *
                  </Label>
                  <Input
                    id="customerName"
                    placeholder="Enter customer name"
                    value={customerName}
                    // @ts-ignore
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="h-9 bg-muted border-border text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Payment Type *</Label>
                  <RadioGroup value={paymentType} onValueChange={(value) => setPaymentType(value as "CASH" | "CARD")}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="CASH" id="cash" />
                      <Label htmlFor="cash" className="text-sm font-normal cursor-pointer">
                        Cash
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="CARD" id="card" />
                      <Label htmlFor="card" className="text-sm font-normal cursor-pointer">
                        Credit Card
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seating" className="text-sm font-medium">
                    Seating Location *
                  </Label>
                  <Input
                    id="seating"
                    placeholder="e.g., Table 5, Booth 2"
                    value={seating}
                    // @ts-ignore
                    onChange={(e) => setSeating(e.target.value)}
                    className="h-9 bg-muted border-border text-sm"
                  />
                </div>

                {/* Order Summary */}
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Order Summary</h3>
                  <div className="space-y-2">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-medium text-foreground">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-border bg-card">
                <div className="px-6 py-5 space-y-4">
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-sm font-semibold text-foreground">
                      Total
                    </span>
                    <span className="text-xl font-bold text-primary">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 text-sm font-medium transition-colors"
                    disabled={submitting}
                    onClick={handleConfirmOrder}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Confirm Order"
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}