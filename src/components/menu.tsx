"use client";

import { useState, useEffect } from "react";
import { Plus, Minus, ShoppingCart, X, Loader2, ArrowLeft } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  image: string | null;
  price: number;
  description?: string | null;
  available: boolean;
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
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [selectedMobileCard, setSelectedMobileCard] = useState<string | null>(null);

  // Fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/menu-items");

        if (!response.ok) {
          throw new Error("Failed to fetch menu items");
        }

        const data = await response.json();
        // Filter only available items
        const availableProducts = data.filter((item: Product) => item.available);
        setProducts(availableProducts);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load products");
        console.error("Error fetching products:", err);
        toast.error("Failed to load menu items", {
          description: "Please try refreshing the page.",
        });
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
    setIsCartOpen(true);
    setSelectedMobileCard(null);
    toast.success(`${product.name} added to cart`);
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

  const handleBackToCart = () => {
    setShowOrderForm(false);
  };

  const handleConfirmOrder = async () => {
    if (!customerName.trim()) {
      toast.error("Customer name is required", {
        description: "Please enter a customer name before placing the order.",
      });
      return;
    }

    if (!paymentType) {
      toast.error("Payment type is required", {
        description: "Please select a payment type before placing the order.",
      });
      return;
    }

    if (!seating.trim()) {
      toast.error("Seating Location is required", {
        description: "Please enter a seating location before placing the order.",
      });
      return;
    }

    try {
      setSubmitting(true);
      const orderData = {
        customerName: customerName.trim(),
        paymentType,
        Seating: seating.trim(),
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

      setShowSuccessDialog(true);
      // Reset form state
      setCart({});
      setCustomerName("");
      setPaymentType("");
      setSeating("");
      setShowOrderForm(false);
      setIsCartOpen(false);
    } catch (err) {
      console.error("Error placing order:", err);
      toast.error("Failed to place order", {
        description: "Please try again later.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const cartItems = Object.values(cart);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div id="order" className="min-h-screen bg-black py-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-lime-500 text-xl mb-2" style={{ fontFamily: 'Georgia, serif' }}>Our Menu</p>
            <h2 className="text-white text-4xl md:text-5xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>
              Premium Selection
            </h2>
          </div>
          <Button
            className="flex items-center gap-2 bg-lime-500 hover:bg-lime-600 text-black font-semibold"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="w-5 h-5" />
            Cart {totalItems > 0 && `(${totalItems})`}
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96">
            <Loader2 className="w-12 h-12 animate-spin text-lime-500 mb-4" />
            <p className="text-zinc-400">Loading menu...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="text-red-500 text-lg font-semibold mb-2">Failed to load menu</div>
            <p className="text-zinc-400 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-lime-500 hover:bg-lime-600 text-black"
            >
              Retry
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96">
            <ShoppingCart className="w-16 h-16 text-zinc-600 mb-4" />
            <p className="text-zinc-400 text-lg">No items available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const inCart = cart[product.id];
              const isHovered = hoveredCard === product.id;
              const isMobileSelected = selectedMobileCard === product.id;

              return (
                <div
                  key={product.id}
                  className="relative group cursor-pointer h-96 overflow-hidden rounded-lg"
                  onMouseEnter={() => setHoveredCard(product.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      setSelectedMobileCard(isMobileSelected ? null : product.id);
                    }
                  }}
                >
                  <div className="relative w-full h-full border-2 border-lime-500 rounded-lg overflow-hidden shadow-[0_0_20px_rgba(132,204,22,0.3)]">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                        <ShoppingCart className="w-16 h-16 text-zinc-700" />
                      </div>
                    )}
                    
                    {/* Badge for items in cart */}
                    {inCart && inCart.quantity > 0 && (
                      <div className="absolute top-3 right-3 bg-lime-500 text-black px-3 py-1 rounded-full font-bold text-sm shadow-lg z-20">
                        {inCart.quantity}
                      </div>
                    )}

                    {/* Desktop Hover Overlay */}
                    <div
                      className={`hidden md:flex z-50 absolute inset-0 bg-lime-500/90 backdrop-blur-sm transition-opacity duration-300 flex-col items-center justify-center ${
                        isHovered ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <div className="text-center px-6 text-black">
                        <h3 className="text-2xl font-bold mb-3">{product.name}</h3>
                        {product.description && (
                          <p className="text-sm leading-relaxed font-medium mb-4">{product.description}</p>
                        )}
                        <p className="text-3xl font-bold mb-6">${product.price.toFixed(2)}</p>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                          }}
                          className="bg-black text-lime-500 hover:bg-zinc-900"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>

                    {/* Mobile Bottom Sheet */}
                    <div
                      className={`md:hidden z-50 absolute inset-x-0 bottom-0 bg-black/95 backdrop-blur-sm transition-transform duration-300 ${
                        isMobileSelected ? "translate-y-0" : "translate-y-full"
                      }`}
                    >
                      <div className="p-6 text-white">
                        <h3 className="text-xl font-bold mb-2 text-lime-500">{product.name}</h3>
                        {product.description && (
                          <p className="text-sm text-zinc-300 mb-4">{product.description}</p>
                        )}
                        <p className="text-2xl font-bold mb-4 text-lime-500">${product.price.toFixed(2)}</p>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                          }}
                          className="w-full bg-lime-500 hover:bg-lime-600 text-black"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>

                    {/* Neon glow effect */}
                    <div className="absolute inset-0 border-2 border-lime-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[inset_0_0_20px_rgba(132,204,22,0.2)]" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart Sheet */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col bg-black border-lime-500">
          <SheetHeader className="px-6 py-4 border-b border-zinc-800">
            <SheetTitle className="flex items-center gap-2.5 text-white">
              {showOrderForm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 -ml-2 text-white hover:bg-lime-500"
                  onClick={handleBackToCart}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <ShoppingCart className="w-5 h-5 text-lime-500" />
              <span className="flex-1">{showOrderForm ? "Order Details" : "Your Cart"}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -mr-2 text-white hover:bg-zinc-900 md:hidden"
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
                        className="bg-zinc-900 rounded-lg p-3.5 border border-zinc-800 transition-all hover:border-lime-500/50"
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
                  <span className="text-xl font-bold text-lime-500">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <Button
                  className="w-full bg-lime-500 hover:bg-lime-600 text-black h-10"
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
                      <RadioGroupItem value="CASH" id="cash" className="border-zinc-700 text-lime-500" />
                      <Label htmlFor="cash" className="font-normal cursor-pointer text-white">Cash</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="CARD" id="card" className="border-zinc-700 text-lime-500" />
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
                  <span className="text-xl font-bold text-lime-500">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <Button
                  className="w-full bg-lime-500 hover:bg-lime-600 text-black h-10"
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

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-lime-500">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-lime-500/20">
              <svg
                className="h-6 w-6 text-lime-500"
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
            <DialogTitle className="text-center text-xl text-white">
              Order Placed Successfully!
            </DialogTitle>
            <DialogDescription className="text-center text-zinc-400">
              Your order has been confirmed and sent to the kitchen.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <Button 
              onClick={() => setShowSuccessDialog(false)}
              className="bg-lime-500 hover:bg-lime-600 text-black"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Menu;