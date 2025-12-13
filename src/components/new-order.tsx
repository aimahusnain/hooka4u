"use client"

import { EmptyHookahState } from "@/components/empty-hookah-state"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Loader2, Minus, Plus, ShoppingCart, X } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  image: string
  price: number
  description?: string
}

interface CartItem extends Product {
  quantity: number
}

interface CartState {
  [key: string]: CartItem
}

export default function NewOrder() {
  const [customerName, setCustomerName] = useState("")
  const [paymentType, setPaymentType] = useState<"CASH" | "CARD" | "">("")
  const [seating, setSeating] = useState("")
  const [cart, setCart] = useState<CartState>({})
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false)
  const [mobileSheetView, setMobileSheetView] = useState<"cart" | "form">("cart")
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [lastOrderId, setLastOrderId] = useState<string>("")

  // Fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/menu-items")

        if (!response.ok) {
          throw new Error("Failed to fetch menu items")
        }

        const json = await response.json()
        const data: Product[] = Array.isArray(json) ? (json as Product[]) : []
        setProducts(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load products")
        console.error("Error fetching products:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const addToCart = (product: Product) => {
    setCart((prev) => ({
      ...prev,
      [product.id]: {
        ...product,
        quantity: (prev[product.id]?.quantity || 0) + 1,
      },
    }))
  }

  const updateQuantity = (productId: string, change: number) => {
    setCart((prev) => {
      const currentQty = prev[productId]?.quantity || 0
      const newQty = currentQty + change

      if (newQty <= 0) {
        const { [productId]: removed, ...rest } = prev
        return rest
      }

      return {
        ...prev,
        [productId]: {
          ...prev[productId],
          quantity: newQty,
        },
      }
    })
  }

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const { [productId]: removed, ...rest } = prev
      return rest
    })
  }

  const handleProductClick = (product: Product) => {
    const inCart = cart[product.id]
    if (inCart && inCart.quantity === 1) {
      removeFromCart(product.id)
    } else {
      addToCart(product)
    }
  }

  const handlePlaceOrderClick = () => {
    if (cartItems.length === 0) return
    setShowOrderForm(true)
  }

  const handleMobileOrderButton = () => {
    setIsMobileSheetOpen(true)
    setMobileSheetView("cart")
  }

  const handleMobileSheetPlaceOrder = () => {
    if (cartItems.length === 0) return
    setMobileSheetView("form")
  }

  const handleMobileSheetBackToCart = () => {
    setMobileSheetView("cart")
  }

  const handleBackToCart = () => {
    setShowOrderForm(false)
  }

  const handleConfirmOrder = async () => {
    if (!customerName.trim()) {
      toast.info("Customer name is required", {
        description: "Please enter a customer name before placing the order.",
        action: {
          label: "Close",
          onClick: () => console.log("Toast Closed"),
        },
      })
      return
    }

    if (!paymentType) {
      toast.info("Payment type is required", {
        description: "Please select a payment type before placing the order.",
        action: {
          label: "Close",
          onClick: () => console.log("Toast Closed"),
        },
      })
      return
    }

    if (!seating.trim()) {
      toast.info("Seating Location is required", {
        description: "Please enter a seating location before placing the order.",
        action: {
          label: "Close",
          onClick: () => console.log("Toast Closed"),
        },
      })
      return
    }

    try {
      setSubmitting(true)
      const orderData = {
        customerName: customerName.trim(),
        paymentType,
        Seating: seating.trim() || null,
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        subtotal,
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        throw new Error("Failed to place order")
      }

      const order = await response.json()

      setLastOrderId(order.id)
      setShowSuccessDialog(true)

      setCart({})
      setCustomerName("")
      setPaymentType("")
      setSeating("")
      setShowOrderForm(false)
      setIsCartOpen(false)
      setIsMobileSheetOpen(false)
      setMobileSheetView("cart")
    } catch (err) {
      console.error("Error placing order:", err)
      toast.error("We are sorry to say, but your order cannot be placed", {
        description: "Please try again later!",
        action: {
          label: "Close",
          onClick: () => console.log("Toast Closed"),
        },
      })
    } finally {
      setSubmitting(false)
    }
  }

  const cartItems = Object.values(cart)
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="flex flex-col h-screen bg-background">

      {/* Main Content */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Products Section */}
        <div className="flex-1 flex flex-col overflow-hidden pb-20 md:pb-0">
          <div className="flex-1 overflow-y-auto p-3 sm:p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground text-sm">Loading menu items...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-destructive text-sm font-medium mb-2">Error loading products</div>
                <p className="text-muted-foreground text-xs">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 bg-transparent"
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {products.map((product) => {
                  const inCart = cart[product.id]
                  const isSelected = inCart && inCart.quantity > 0

                  return (
<div
  key={product.id}
  className={`cursor-pointer transition-all border overflow-hidden rounded-lg relative ${
    isSelected
      ? "bg-lime-100 dark:bg-lime-950 shadow-md border-lime-300 dark:border-lime-800"
      : "border-zinc-700 bg-zinc-800 hover:border-lime-500 hover:shadow-sm"
  }`}
  onClick={() => handleProductClick(product)}
>
  {/* Square Image Container */}
  <div className="relative w-full h-82 pt-[100%] bg-zinc-900 overflow-hidden">

    {/* Product Image */}
    {product.image ? (
      <img
        src={product.image || "/placeholder.svg"}
        alt={product.name}
        className="absolute inset-0 w-full h-full object-cover"
      />
    ) : (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
        <ShoppingCart className="w-10 h-10 text-zinc-700" />
      </div>
    )}

    {/* Price Badge */}
    <div className="absolute top-3 left-3 bg-lime-500 text-black text-sm font-semibold px-3 py-1 rounded-full shadow-md">
      ${product.price.toFixed(2)}
    </div>

    {/* Quantity Badge */}
    {isSelected && (
      <div className="absolute top-3 right-3 bg-lime-500 text-black px-2 py-1 text-xs font-medium rounded-full shadow-md">
        {inCart.quantity}
      </div>
    )}

    {/* Bottom Overlay */}
    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent space-y-2">

      {/* Title */}
      <h3 className="text-white font-semibold text-sm leading-tight">
        {product.name}
      </h3>

      {/* Description */}
      {product.description && (
        <p className="text-zinc-300 text-xs line-clamp-2">
          {product.description}
        </p>
      )}

      {/* Add to Cart Button */}
      <button
        className="w-full mt-2 bg-lime-500 hover:bg-lime-400 text-black text-sm font-semibold py-2 rounded-md transition"
      >
        Add to Cart
      </button>
    </div>
  </div>
</div>

                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Cart Sidebar */}
        <div
          className={`hidden md:flex flex-col transition-all duration-300 ease-in-out border-l border-border bg-zinc-250 text-white ${
            isCartOpen ? "w-[400px]" : "w-0"
          } overflow-hidden`}
        >
          {isCartOpen && !showOrderForm && (
            <>
              {/* Cart Header */}
              <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-lime-500" />
                  Current Order
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-zinc-800 text-white"
                  onClick={() => setIsCartOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                    <ShoppingCart className="w-12 h-12 mb-3 opacity-50" />
                    <p className="font-medium text-sm">No items yet</p>
                    <p className="text-xs text-center mt-1 text-zinc-500">Select products to start</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="bg-zinc-800 rounded-lg p-3.5 border border-zinc-700 transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-white truncate">{item.name}</h4>
                            <p className="text-xs text-zinc-400 mt-0.5">${item.price.toFixed(2)}</p>
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
                            <span className="w-6 text-center font-semibold text-sm text-white">{item.quantity}</span>
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
                  <span className="text-xl font-bold text-lime-500">${subtotal.toFixed(2)}</span>
                </div>
                <Button
                  className="w-full bg-lime-600 hover:bg-lime-700 text-white h-10 text-sm font-medium transition-colors"
                  disabled={cartItems.length === 0}
                  onClick={handlePlaceOrderClick}
                >
                  Place Order
                </Button>
              </div>
            </>
          )}

          {isCartOpen && showOrderForm && (
            <>
              {/* Order Form Header */}
              <div className="flex items-center gap-2 p-4 border-b border-zinc-800 bg-zinc-900">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 -ml-2 hover:bg-zinc-800 text-white"
                  onClick={handleBackToCart}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-lime-500" />
                  Order Details
                </h2>
              </div>

              {/* Order Form Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName" className="text-sm font-medium text-white">
                    Customer Name *
                  </Label>
                  <Input
                    id="customerName"
                    placeholder="Enter customer name"
                    value={customerName}
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
                        Card
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
                    placeholder="Enter seating location"
                    value={seating}
                    onChange={(e) => setSeating(e.target.value)}
                    className="h-9 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 text-sm"
                  />
                </div>

                <div className="border-t border-zinc-800 pt-4">
                  <h3 className="font-semibold text-sm text-white mb-3">Order Summary</h3>
                  <div className="space-y-2">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-zinc-400">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="text-lime-500 font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-zinc-800">
                    <span className="font-semibold text-white">Total</span>
                    <span className="text-xl font-bold text-lime-500">${subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Order Form Footer */}
              <div className="border-t border-zinc-800 bg-zinc-900 p-4">
                <Button
                  className="w-full bg-lime-600 hover:bg-lime-700 text-white h-10 text-sm font-medium transition-colors"
                  onClick={handleConfirmOrder}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Placing Order...
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

      {/* Mobile Bottom Button */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 md:hidden p-4">
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
      {isMobileSheetOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileSheetOpen(false)} />
      )}

      {/* Mobile Sheet Drawer */}
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
                  <p className="text-xs text-center mt-1 text-zinc-500">Select products to start</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="bg-zinc-800 rounded-lg p-3.5 border border-zinc-700 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-white truncate">{item.name}</h4>
                          <p className="text-xs text-zinc-400 mt-0.5">${item.price.toFixed(2)}</p>
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
                          <span className="w-6 text-center font-semibold text-sm text-white">{item.quantity}</span>
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
                <span className="text-xl font-bold text-lime-500">${subtotal.toFixed(2)}</span>
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
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-9 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-white">Payment Type *</Label>
                <RadioGroup value={paymentType} onValueChange={(value) => setPaymentType(value as "CASH" | "CARD")}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CASH" id="cash-mobile" className="border-zinc-600 text-lime-500" />
                    <Label htmlFor="cash-mobile" className="text-sm font-normal cursor-pointer text-white">
                      Cash
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CARD" id="card-mobile" className="border-zinc-600 text-lime-500" />
                    <Label htmlFor="card-mobile" className="text-sm font-normal cursor-pointer text-white">
                      Card
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seating-mobile" className="text-sm font-medium text-white">
                  Seating Location *
                </Label>
                <Input
                  id="seating-mobile"
                  placeholder="Enter seating location"
                  value={seating}
                  onChange={(e) => setSeating(e.target.value)}
                  className="h-9 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 text-sm"
                />
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <h3 className="font-semibold text-sm text-white mb-3">Order Summary</h3>
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-zinc-400">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="text-lime-500 font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-zinc-800">
                  <span className="font-semibold text-white">Total</span>
                  <span className="text-xl font-bold text-lime-500">${subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Order Form Footer */}
            <div className="border-t border-zinc-800 bg-zinc-900 p-4">
              <Button
                className="w-full bg-lime-600 hover:bg-lime-700 text-white h-10 text-sm font-medium transition-colors"
                onClick={handleConfirmOrder}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  "Confirm Order"
                )}
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Floating Cart Button - Desktop */}
      <button
        onClick={() => setIsCartOpen(!isCartOpen)}
        className="hidden md:flex fixed top-6 right-6 z-50 bg-lime-500 text-black p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300"
      >
        <ShoppingCart className="w-6 h-6" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
            {totalItems}
          </span>
        )}
      </button>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md bg-zinc-900 text-white border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-lime-500 text-xl">Order Placed Successfully!</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Your order has been placed and is being prepared.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-zinc-400">Order ID:</p>
              <p className="text-lg font-semibold text-white">{lastOrderId}</p>
            </div>
            <Button
              onClick={() => setShowSuccessDialog(false)}
              className="w-full bg-lime-600 hover:bg-lime-700 text-white"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
