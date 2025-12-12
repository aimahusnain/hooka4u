"use client";

import { useState, useEffect } from "react";
import { Plus, Minus, ShoppingCart, X, Loader2, ArrowLeft } from 'lucide-react';

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

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [cart, setCart] = useState<CartState>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [paymentType, setPaymentType] = useState<"CASH" | "CARD" | "">("");
  const [seating, setSeating] = useState("");

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/menu-items");

        if (!response.ok) {
          throw new Error("Failed to fetch menu items");
        }

        const data = await response.json();
        const availableProducts = data.filter((item: Product) => item.available);
        setProducts(availableProducts);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load products");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      handleNext();
    }
    if (touchStart - touchEnd < -75) {
      handlePrev();
    }
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? products.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === products.length - 1 ? 0 : prev + 1));
  };

  const addToCart = (product: Product) => {
    setCart((prev) => ({
      ...prev,
      [product.id]: {
        ...product,
        quantity: (prev[product.id]?.quantity || 0) + 1,
      },
    }));
    
    const btn = document.getElementById(`add-btn-${product.id}`);
    if (btn) {
      btn.textContent = '✓ Added!';
      setTimeout(() => {
        btn.textContent = 'Add to Cart';
      }, 1000);
    }
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
      alert("Customer name is required");
      return;
    }

    if (!paymentType) {
      alert("Payment type is required");
      return;
    }

    if (!seating.trim()) {
      alert("Seating location is required");
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

      setShowSuccessDialog(true);
      setCart({});
      setCustomerName("");
      setPaymentType("");
      setSeating("");
      setShowOrderForm(false);
      setIsCartOpen(false);
    } catch (err) {
      console.error("Error placing order:", err);
      alert("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const cartItems = Object.values(cart);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-lime-500" />
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-900 to-black"></div>

        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-lime-500 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-lime-500 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold mb-12 sm:mb-20 tracking-tight">
            <span className="block text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
              Welcome To
            </span>
            <span className="block bg-gradient-to-r from-lime-400 via-lime-500 to-lime-600 text-transparent bg-clip-text" style={{ fontFamily: "Georgia, serif" }}>
              VIP SERVICE 4U
            </span>
          </h1>

          <div className="flex justify-center">
            <button
              onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
              className="group relative px-12 sm:px-20 py-4 sm:py-6 text-lg sm:text-xl md:text-2xl font-semibold text-black bg-gradient-to-r from-lime-400 to-lime-500 overflow-hidden transition-all duration-500 hover:scale-105"
              style={{ fontFamily: "Georgia, serif", letterSpacing: "0.05em", boxShadow: "0 10px 40px rgba(132, 204, 22, 0.4)" }}
            >
              <span className="relative z-10 uppercase">View Items</span>
              <div className="absolute inset-0 bg-gradient-to-r from-lime-500 to-lime-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </button>
          </div>
        </div>

        {/* Floating Cart Button */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed top-6 right-6 z-50 bg-lime-500 text-black p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300"
        >
          <ShoppingCart className="w-6 h-6" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
              {totalItems}
            </span>
          )}
        </button>
      </section>

      {/* Menu Section */}
      <section id="menu" className="bg-black">
        {/* Desktop Grid View */}
        <div className="hidden md:block min-h-screen bg-gradient-to-b from-black to-zinc-900 py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-6xl font-bold text-center mb-16 text-white" style={{ fontFamily: "Georgia, serif" }}>
              Our <span className="text-lime-500">Items</span>
            </h2>
            {error ? (
              <div className="flex flex-col items-center justify-center h-96">
                <div className="text-red-500 text-lg font-semibold mb-2">Failed to load menu</div>
                <p className="text-zinc-400 mb-4">{error}</p>
                <button onClick={() => window.location.reload()} className="px-6 py-3 bg-lime-500 text-black rounded-lg">
                  Retry
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96">
                <ShoppingCart className="w-16 h-16 text-zinc-600 mb-4" />
                <p className="text-zinc-400 text-lg">No items available</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => (
                  <div key={product.id} className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-zinc-700">
                    <div className="relative h-64 overflow-hidden">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                          <ShoppingCart className="w-16 h-16 text-zinc-700" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-lime-500 text-black px-3 py-1 rounded-full font-bold">
                        ${product.price.toFixed(2)}
                      </div>
                      {cart[product.id] && (
                        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm">
                          {cart[product.id].quantity}
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "Georgia, serif" }}>
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-zinc-400 mb-4 text-sm">{product.description}</p>
                      )}
                      <button
                        id={`add-btn-${product.id}`}
                        onClick={() => addToCart(product)}
                        className="w-full py-3 bg-lime-500 text-black font-semibold rounded-lg hover:bg-lime-600 transition-colors duration-300"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Full-Screen Slider */}
        <div className="md:hidden relative">
          {error ? (
            <div className="h-screen flex flex-col items-center justify-center p-6">
              <div className="text-red-500 text-lg font-semibold mb-2">Failed to load menu</div>
              <p className="text-zinc-400 mb-4">{error}</p>
              <button onClick={() => window.location.reload()} className="px-6 py-3 bg-lime-500 text-black rounded-lg">
                Retry
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="h-screen flex flex-col items-center justify-center">
              <ShoppingCart className="w-16 h-16 text-zinc-600 mb-4" />
              <p className="text-zinc-400 text-lg">No items available</p>
            </div>
          ) : (
            <div
              className="overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="flex transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {products.map((product) => (
                  <div key={product.id} className="w-full flex-shrink-0 h-screen relative">
                    <div className="absolute inset-0">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                          <ShoppingCart className="w-32 h-32 text-zinc-700" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                    </div>

                    {cart[product.id] && (
                      <div className="absolute top-6 right-6 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg z-20">
                        {cart[product.id].quantity} in cart
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-6 pb-8 z-10">
                      <div className="mb-6">
                        <div className="inline-block bg-lime-500 text-black px-4 py-2 rounded-full font-bold text-2xl mb-4">
                          ${product.price.toFixed(2)}
                        </div>
                        <h3 className="text-4xl font-bold text-white mb-3" style={{ fontFamily: "Georgia, serif" }}>
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-zinc-200 text-lg mb-4">{product.description}</p>
                        )}
                      </div>

                      <button
                        id={`add-btn-${product.id}`}
                        onClick={() => addToCart(product)}
                        className="w-full py-5 bg-lime-500 text-black font-bold text-xl rounded-xl shadow-lg active:scale-95 transition-all duration-150"
                        style={{ fontFamily: "Georgia, serif" }}
                      >
                        Add to Cart
                      </button>

                      <div className="flex justify-center gap-2 mt-6">
                        {products.map((_, index) => (
                          <div
                            key={index}
                            className={`h-2 rounded-full transition-all duration-300 ${
                              index === currentIndex ? "bg-lime-500 w-8" : "bg-zinc-500 w-2"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-end md:items-center justify-center">
          <div className="bg-zinc-900 w-full md:max-w-2xl md:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-zinc-700 flex justify-between items-center">
              <div className="flex items-center gap-3">
                {showOrderForm && (
                  <button onClick={handleBackToCart} className="text-white hover:text-lime-500">
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                )}
                <ShoppingCart className="w-6 h-6 text-lime-500" />
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
                  {showOrderForm ? "Order Details" : "Your Cart"}
                </h2>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="text-zinc-400 hover:text-white text-3xl">
                <X className="w-8 h-8" />
              </button>
            </div>

            {!showOrderForm ? (
              <>
                <div className="flex-1 overflow-y-auto p-6">
                  {cartItems.length === 0 ? (
                    <div className="text-center text-zinc-400 py-12">
                      <ShoppingCart className="w-24 h-24 mx-auto mb-4 opacity-50" />
                      <p className="text-xl">Your cart is empty</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.id} className="bg-zinc-800 rounded-xl p-4 flex gap-4 border border-zinc-700">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                          )}
                          <div className="flex-1">
                            <h3 className="text-white font-bold text-lg mb-1">{item.name}</h3>
                            <p className="text-lime-500 font-bold text-xl mb-2">${item.price.toFixed(2)}</p>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-8 h-8 bg-zinc-700 rounded-lg text-white hover:bg-zinc-600"
                              >
                                <Minus className="w-4 h-4 mx-auto" />
                              </button>
                              <span className="text-white font-bold">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-8 h-8 bg-zinc-700 rounded-lg text-white hover:bg-zinc-600"
                              >
                                <Plus className="w-4 h-4 mx-auto" />
                              </button>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="ml-auto text-red-500 hover:text-red-400"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {cartItems.length > 0 && (
                  <div className="p-6 border-t border-zinc-700">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-bold text-white">Total:</span>
                      <span className="text-3xl font-bold text-lime-500">${subtotal.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={handlePlaceOrderClick}
                      className="w-full py-4 bg-lime-500 text-black font-bold text-xl rounded-xl hover:bg-lime-600 transition-colors duration-300"
                    >
                      Place Order
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <div>
                    <label className="text-white font-semibold mb-2 block">Customer Name *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter customer name"
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-white rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-white font-semibold mb-2 block">Payment Type *</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 text-white cursor-pointer">
                        <input
                          type="radio"
                          name="payment"
                          value="CASH"
                          checked={paymentType === "CASH"}
                          onChange={() => setPaymentType("CASH")}
                          className="w-5 h-5"
                        />
                        Cash
                      </label>
                      <label className="flex items-center gap-3 text-white cursor-pointer">
                        <input
                          type="radio"
                          name="payment"
                          value="CARD"
                          checked={paymentType === "CARD"}
                          onChange={() => setPaymentType("CARD")}
                          className="w-5 h-5"
                        />
                        Credit Card
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-white font-semibold mb-2 block">Seating Location *</label>
                    <input
                      type="text"
                      value={seating}
                      onChange={(e) => setSeating(e.target.value)}
                      placeholder="e.g., Table 5, Booth 2"
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-white rounded-lg"
                    />
                  </div>

                  <div className="pt-4 border-t border-zinc-700">
                    <h3 className="text-white font-semibold mb-3">Order Summary</h3>
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-zinc-300 mb-2">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="text-white font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 border-t border-zinc-700">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold text-white">Total:</span>
                    <span className="text-3xl font-bold text-lime-500">${subtotal.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handleConfirmOrder}
                    disabled={submitting}
                    className="w-full py-4 bg-lime-500 text-black font-bold text-xl rounded-xl hover:bg-lime-600 transition-colors duration-300 disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      "Confirm Order"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Success Dialog */}
      {showSuccessDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-2xl p-8 max-w-md w-full border border-lime-500">
            <div className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-lime-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Order Placed!</h3>
              <p className="text-zinc-400 mb-6">Your order has been confirmed</p>
              <button
                onClick={() => setShowSuccessDialog(false)}
                className="px-8 py-3 bg-lime-500 text-black font-bold rounded-lg hover:bg-lime-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}