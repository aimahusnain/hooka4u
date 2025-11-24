"use client"

import { useState } from "react"
import { Plus, Minus, ShoppingCart, Search, X } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Product {
  id: number
  name: string
  price: number
  category: string
}

interface CartItem extends Product {
  quantity: number
}

interface CartState {
  [key: number]: CartItem
}

export default function NewOrder() {
  const [customerName, setCustomerName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [cart, setCart] = useState<CartState>({})

  const products: Product[] = [
    { id: 1, name: "Espresso", price: 3.5, category: "Coffee" },
    { id: 2, name: "Cappuccino", price: 4.5, category: "Coffee" },
    { id: 3, name: "Latte", price: 4.75, category: "Coffee" },
    { id: 4, name: "Americano", price: 3.75, category: "Coffee" },
    { id: 5, name: "Mocha", price: 5.0, category: "Coffee" },
    { id: 6, name: "Green Tea", price: 3.0, category: "Tea" },
    { id: 7, name: "Black Tea", price: 2.75, category: "Tea" },
    { id: 8, name: "Chai Latte", price: 4.25, category: "Tea" },
    { id: 9, name: "Croissant", price: 3.5, category: "Bakery" },
    { id: 10, name: "Muffin", price: 3.25, category: "Bakery" },
    { id: 11, name: "Bagel", price: 2.5, category: "Bakery" },
    { id: 12, name: "Sandwich", price: 7.5, category: "Food" },
  ]

  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const addToCart = (product: Product) => {
    setCart((prev) => ({
      ...prev,
      [product.id]: {
        ...product,
        quantity: (prev[product.id]?.quantity || 0) + 1,
      },
    }))
  }

  const updateQuantity = (productId: number, change: number) => {
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

  const removeFromCart = (productId: number) => {
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

  const cartItems = Object.values(cart)
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex h-14 shrink-0 items-center gap-3 bg-card border-b border-border">
        <div className="flex items-center gap-3 px-5 w-full">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#" className="text-muted-foreground hover:text-foreground text-sm">
                  Order Taking
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-foreground text-sm font-medium">New Order</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Products Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="gap-3 flex px-6 py-4 bg-card border-b border-border">
            <Input
              placeholder="Customer Name"
              value={customerName}
              // @ts-ignore
              onChange={(e) => setCustomerName(e.target.value)}
              className="max-w-md h-9 bg-muted border-border text-sm"
              />
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                // @ts-ignore
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-muted border-border text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map((product) => {
                const inCart = cart[product.id]
                const isSelected = inCart && inCart.quantity > 0

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
                    <CardContent className="px-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-sm text-foreground leading-snug">{product.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{product.category}</p>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-semibold text-base text-foreground">${product.price.toFixed(2)}</span>
                        {isSelected && (
                          <Badge className="bg-primary hover:bg-primary text-primary-foreground px-2 py-0.5 text-xs font-medium">
                            {inCart.quantity}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>

        <div className="w-full md:w-96 lg:w-[400px] bg-card border-l border-border flex flex-col">
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

          {/* Cart Items - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-6 text-muted-foreground">
                <ShoppingCart className="w-14 h-14 mb-3 opacity-30" />
                <p className="font-medium text-muted-foreground text-sm">No items yet</p>
                <p className="text-xs text-center mt-1 text-muted-foreground/80">Select products to start</p>
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
                        <h4 className="font-medium text-sm text-foreground truncate">{item.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">${item.price.toFixed(2)}</p>
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
                        <span className="w-6 text-center font-semibold text-sm text-foreground">{item.quantity}</span>
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
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (10%)</span>
                  <span className="font-medium text-foreground">${tax.toFixed(2)}</span>
                </div>
                <Separator className="my-3 bg-border" />
                <div className="flex justify-between items-center pt-1">
                  <span className="text-sm font-semibold text-foreground">Total</span>
                  <span className="text-xl font-bold text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 text-sm font-medium transition-colors"
                disabled={cartItems.length === 0}
              >
                Place Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
