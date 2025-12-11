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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  description?: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  [key: string]: CartItem;
}

const Menu = () => {
  const [customerName, setCustomerName] = useState("");
  const [paymentType, setPaymentType] = useState<"CASH" | "CARD" | "">("");
  const [seating, setSeating] = useState("");
  const [cart, setCart] = useState<CartState>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [mobileSheetView, setMobileSheetView] = useState<"cart" | "form">("cart");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string>("");

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
    
    // Open the cart sheet when item is added
    setIsCartOpen(true);
    
 
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

  const handlePlaceOrderClick = () => {
    if (cartItems.length === 0) return;
    setShowOrderForm(true);
  };

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

    if (!paymentType) {
      toast.info("Payment type is required", {
        description: "Please select a payment type before placing the order.",
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
        Seating: seating.trim() || null,
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

      setLastOrderId(order.id);
      setShowSuccessDialog(true);

      // Reset form state
      setCart({});
      setCustomerName("");
      setPaymentType("");
      setSeating("");
      setShowOrderForm(false);
      setIsCartOpen(false);
      setIsMobileSheetOpen(false);
      setMobileSheetView("cart");

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
    <>
    <div  id="menu-section" className="flex-1  flex flex-col overflow-hidden pb-20 md:pb-0 bg-black">
      <div className="w-full flex justify-between px-6">
            <div className="16">
          <h3 className="text-lime-500 font-script text-xl mb-4">Our Menu</h3>
          <h2 className="text-white text-4xl font-bold">This is our Menu</h2>
        </div>
            <Button
              className=" md:flex w-fit  md:right-6 md:top-6 z-50 h-12 px-4 bg-primary hover:bg-primary/90 text-black shadow-lg"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Cart {totalItems > 0 && `(${totalItems})`}
            </Button>
      </div>
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
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 w-full   gap-3 sm:gap-4">
                {products.map((product) => {
                  const inCart = cart[product.id];
                  const isSelected = inCart && inCart.quantity > 0;

                  return (
                 <Card
  key={product.id}
  className="border overflow-hidden p-0 bg-black border-border/10 !text-white hover:border-primary/50 hover:shadow-sm transition-all"
>
  <CardContent className="p-0 text-white">
    {/* Square Image Container */}
    <div className="relative w-full pt-[100%] bg-muted overflow-hidden">
      {product.image ? (
        <img
          src={product.image}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground/30" />
        </div>
      )}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <Badge className="bg-primary hover:bg-primary text-primary-foreground px-2 py-1 text-xs font-medium shadow-md">
            {inCart.quantity}
          </Badge>
        </div>
      )}
    </div>

    {/* Product Info */}
    <div className="p-4 space-y-3">
      <div className="space-y-1">
        <h3 className="font-semibold text-sm sm:text-base leading-tight line-clamp-1">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        )}
      </div>
      
      <div className="flex items-center justify-between pt-1">
        <span className="font-bold text-base sm:text-lg text-primary">
          ${product.price.toFixed(2)}
        </span>
        
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            addToCart(product);
          }}
          className="h-8 px-3 bg-primary  hover:bg-primary/90 text-black text-xs font-medium shadow-sm"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add
        </Button>
      </div>
    </div>
  </CardContent>
</Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
          <div className="flex flex-col">
      {/* Main Content */}
      
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Products Section */}
        

        {/* Desktop 1 Sidebar */}
   <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
  <SheetTrigger asChild>
  
  </SheetTrigger>
  <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col bg-black border-zinc-800">
  <SheetHeader className="px-6 py-4 border-b border-zinc-800">
      <SheetTitle className="flex items-center gap-2.5 text-white">
        {showOrderForm && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 -ml-2 text-white hover:bg-zinc-800"
            onClick={handleBackToCart}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}
        <ShoppingCart className="w-5 h-5 text-primary" />
        
        <span className="flex-1">{showOrderForm ? "Order Details" : "Current Order"}</span>
        
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
          onClick={() => setIsCartOpen(false)}
        >
          <X className="w-4 h-4" />
        </Button>
      </SheetTitle>
      {!showOrderForm && totalItems > 0 && (
        <SheetDescription className="text-zinc-400">
          {totalItems} item{totalItems !== 1 ? 's' : ''} in cart
        </SheetDescription>
      )}
    </SheetHeader>

    {!showOrderForm ? (
      <>
        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto bg-black">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-zinc-500">
              <ShoppingCart className="w-14 h-14 mb-3 opacity-30" />
              <p className="font-medium text-sm">No items yet</p>
              <p className="text-xs text-center mt-1 text-zinc-600">
                Click "Add" on products to start
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-zinc-900 rounded-lg p-3.5 border border-zinc-800 transition-all hover:border-primary/50"
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
                      className="h-7 w-7 -mt-1 -mr-1 hover:bg-red-500/10 hover:text-red-500 text-zinc-400 transition-colors"
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
                        className="h-8 w-8 bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
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
                        className="h-8 w-8 bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <span className="font-semibold text-sm text-white">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        <div className="border-t border-zinc-800 bg-black px-6 py-5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-white">Total</span>
            <span className="text-xl font-bold text-primary">
              ${subtotal.toFixed(2)}
            </span>
          </div>
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10"
            disabled={cartItems.length === 0}
            onClick={handlePlaceOrderClick}
          >
            Place Order
          </Button>
        </div>
      </>
    ) : (
      <>
        {/* Order Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-black">
          <div className="space-y-2">
            <Label htmlFor="customerName" className="text-white">Customer Name *</Label>
            <Input
              id="customerName"
              placeholder="Enter customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Payment Type *</Label>
            <RadioGroup value={paymentType} onValueChange={(value) => setPaymentType(value as "CASH" | "CARD")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CASH" id="cash" className="border-zinc-700 text-primary" />
                <Label htmlFor="cash" className="font-normal cursor-pointer text-white">Cash</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CARD" id="card" className="border-zinc-700 text-primary" />
                <Label htmlFor="card" className="font-normal cursor-pointer text-white">Credit Card</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seating" className="text-white">Seating Location *</Label>
            <Input
              id="seating"
              placeholder="e.g., Table 5, Booth 2"
              value={seating}
              onChange={(e) => setSeating(e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <h3 className="text-sm font-semibold mb-3 text-white">Order Summary</h3>
            <div className="space-y-2">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-zinc-400">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-medium text-white">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Footer */}
        <div className="border-t border-zinc-800 bg-black px-6 py-5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-white">Total</span>
            <span className="text-xl font-bold text-primary">
              ${subtotal.toFixed(2)}
            </span>
          </div>
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10"
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
  </SheetContent>
</Sheet>
        {/* Mobile Bottom Button */}
        
        {/* Mobile Sheet (existing code) */}
        {isMobileSheetOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileSheetOpen(false)}
          />
        )}

        <div
          className={`fixed right-0 top-0 bottom-0 w-full max-w-md bg-zinc-950 dark:bg-zinc-950 text-white shadow-2xl z-50 md:hidden transition-transform duration-300 ease-out flex flex-col ${
            isMobileSheetOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Mobile Sheet Content - Same as before */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800 dark:border-zinc-800 bg-zinc-900 dark:bg-zinc-900">
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

          {mobileSheetView === "cart" ? (
            <>
              <div className="flex-1 overflow-y-auto p-4">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                    <ShoppingCart className="w-12 h-12 mb-3 opacity-50" />
                    <p className="font-medium text-sm">No items yet</p>
                    <p className="text-xs text-center mt-1 text-zinc-500">
                      Click "Add" on products to start
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-zinc-800 dark:bg-zinc-800 rounded-lg p-3.5 border border-zinc-700 dark:border-zinc-700"
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
                            className="h-7 w-7 -mt-1 -mr-1 hover:bg-red-500/20 hover:text-red-400 text-zinc-400"
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
                              className="h-8 w-8 border-zinc-700 hover:bg-zinc-700 bg-transparent text-white"
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
                              className="h-8 w-8 border-zinc-700 hover:bg-zinc-700 bg-transparent text-white"
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

              <div className="border-t border-zinc-800 bg-zinc-900 p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-white">Total</span>
                  <span className="text-xl font-bold text-lime-500">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <Button
                  className="w-full bg-lime-600 hover:bg-lime-700 text-white h-10"
                  disabled={cartItems.length === 0}
                  onClick={handleMobileSheetPlaceOrder}
                >
                  Continue to Order
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Mobile Order Form - Same as before */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName" className="text-white">Customer Name *</Label>
                  <Input
                    id="customerName"
                    placeholder="Enter customer name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Payment Type *</Label>
                  <RadioGroup value={paymentType} onValueChange={(value) => setPaymentType(value as "CASH" | "CARD")}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="CASH" id="cash" />
                      <Label htmlFor="cash" className="text-white font-normal cursor-pointer">Cash</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="CARD" id="card" />
                      <Label htmlFor="card" className="text-white font-normal cursor-pointer">Credit Card</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seating" className="text-white">Seating Location *</Label>
                  <Input
                    id="seating"
                    placeholder="e.g., Table 5, VIP 2"
                    value={seating}
                    onChange={(e) => setSeating(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>

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

              <div className="border-t border-zinc-800 bg-zinc-900 p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-white">Total</span>
                  <span className="text-xl font-bold text-lime-500">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <Button
                  className="w-full bg-lime-600 hover:bg-lime-700 text-white h-10"
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
</div>
{/* Success Dialog */}
  <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
          <svg
            className="h-6 w-6 text-green-600 dark:text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <DialogTitle className="text-center text-xl">
          Order Placed Successfully!
        </DialogTitle>
        <DialogDescription className="text-center">
          <p>Your order has been confirmed and sent to the kitchen.</p>
        </DialogDescription>
      </DialogHeader>
      <div className="flex justify-center mt-4">
        <Button onClick={() => setShowSuccessDialog(false)}>
          Close
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</div>
    </>
  
);
};
export default Menu;