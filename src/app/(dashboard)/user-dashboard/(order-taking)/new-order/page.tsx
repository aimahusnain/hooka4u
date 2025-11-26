"use client";

import { useState, useEffect } from "react";
import { Plus, Minus, ShoppingCart, X, Loader2, ChevronUp } from "lucide-react";
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

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    
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
      setIsCartOpen(false);

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
      <header className="flex h-14 shrink-0 items-center gap-3 bg-card border-b border-border">
        <div className="flex items-center gap-3 px-3 sm:px-5 w-full">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink
                  href="#"
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  Order Taking
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-foreground text-sm font-medium">
                  New Order
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Products Section */}
        <div className="flex-1 flex flex-col overflow-hidden pb-20 md:pb-0">
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
                          ? "bg-violet-100 shadow-md"
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

        {/* Desktop Sidebar - Hidden on Mobile */}
        <div className="hidden md:flex w-96 lg:w-[400px] bg-card border-l border-border flex-col">
          {/* Cart Header */}
          <div className="px-6 py-4 border-b border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2.5">
                <ShoppingCart className="w-5 h-5 text-primary" />
                Current Order
              </h2>
              {totalItems > 0 && (
                <Badge className="bg-primary hover:bg-primary text-primary-foreground px-2.5 py-0.5 text-xs font-medium">
                  {totalItems}
                </Badge>
              )}
            </div>
          </div>

          {/* Order Form */}
          <div className="px-6 py-4 border-b border-border space-y-4">
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
                Seating Location
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
          </div>

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
                disabled={cartItems.length === 0 || submitting}
                onClick={handlePlaceOrder}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  "Place Order"
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Sheet */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
          {/* Bottom Bar - Always Visible */}
          <div 
            className="bg-card border-t border-border px-4 py-3 cursor-pointer"
            onClick={() => setIsCartOpen(!isCartOpen)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Current Order</p>
                  <p className="text-xs text-muted-foreground">
                    {totalItems} {totalItems === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-primary">
                  ${subtotal.toFixed(2)}
                </span>
                <ChevronUp className={`w-5 h-5 text-muted-foreground transition-transform ${isCartOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </div>

          {/* Sliding Cart Panel */}
          <div 
            className={`bg-card border-t border-border transition-all duration-300 ease-in-out ${
              isCartOpen ? 'max-h-[80vh]' : 'max-h-0'
            } overflow-hidden`}
          >
            <div className="flex flex-col h-full max-h-[80vh]">
              {/* Order Form - Mobile */}
              <div className="px-4 py-4 border-b border-border space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="customerNameMobile" className="text-xs font-medium">
                    Customer Name *
                  </Label>
                  <Input
                    id="customerNameMobile"
                    placeholder="Enter customer name"
                    value={customerName}
                    // @ts-ignore
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="h-9 bg-muted border-border text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Payment Type *</Label>
                  <RadioGroup value={paymentType} onValueChange={(value) => setPaymentType(value as "CASH" | "CARD")}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="CASH" id="cashMobile" />
                      <Label htmlFor="cashMobile" className="text-sm font-normal cursor-pointer">
                        Cash
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="CARD" id="cardMobile" />
                      <Label htmlFor="cardMobile" className="text-sm font-normal cursor-pointer">
                        Credit Card
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="seatingMobile" className="text-xs font-medium">
                    Seating Location
                  </Label>
                  <Input
                    id="seatingMobile"
                    placeholder="e.g., Table 5, Booth 2"
                    value={seating}
                    // @ts-ignore
                    onChange={(e) => setSeating(e.target.value)}
                    className="h-9 bg-muted border-border text-sm"
                  />
                </div>
              </div>

              {/* Cart Items - Scrollable */}
              <div className="flex-1 overflow-y-auto">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 px-6 text-muted-foreground">
                    <ShoppingCart className="w-12 h-12 mb-3 opacity-30" />
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
                        className="bg-muted/40 rounded-lg p-3.5 border border-border"
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
                            className="h-7 w-7 -mt-1 -mr-1 hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
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

              {/* Place Order Button */}
              <div className="border-t border-border bg-card p-4">
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 text-sm font-medium"
                  disabled={cartItems.length === 0 || submitting}
                  onClick={handlePlaceOrder}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}