"use client";
import { useState, useEffect, useRef } from "react";
import { Loader2, ShoppingBag, Clock, User, Package, DollarSign, Calendar, CreditCard, Banknote, MapPin, Trash2, Bell } from "lucide-react";
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
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

interface OrderItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
  };
}

interface Order {
  id: string;
  customerName: string;
  subtotal: number;
  createdAt: string;
  items: OrderItem[];
  paymentType?: "CASH" | "CARD";
  Seating?: string;
}

export default function AllOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [newOrderAnimation, setNewOrderAnimation] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousOrderIdsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    // Create audio element for notification sound
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYHGWe77OVvSxMLT6Xl8Lhb');
    
    // Initial fetch
    fetchOrders();
    
    // Request notification permission
    requestNotificationPermission();

    // Fetch orders every 1 minute (60000ms)
    const pollInterval = setInterval(() => {
      fetchOrdersQuietly();
    }, 60000); // 1 minute

    return () => {
      clearInterval(pollInterval);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleNewOrder = (newOrder: Order) => {
    // Play notification sound
    playNotificationSound();
    
    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🔔 New Order Received!', {
        body: `Order from ${newOrder.customerName || 'Guest'} - $${newOrder.subtotal.toFixed(2)}`,
        icon: '/notification-icon.png',
        badge: '/badge-icon.png',
        tag: newOrder.id,
      });
    }
    
    // Trigger animation
    setNewOrderAnimation(newOrder.id);
    setTimeout(() => setNewOrderAnimation(null), 3000);
  };

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => {
        console.log('Could not play notification sound:', err);
      });
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/orders/get");
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      const fetchedOrders = Array.isArray(data) ? data : [];
      
      setOrders(fetchedOrders);
      setLastFetchTime(new Date());
      
      // Initialize previous order IDs
      if (isInitialLoadRef.current) {
        previousOrderIdsRef.current = new Set(fetchedOrders.map((o: Order) => o.id));
        isInitialLoadRef.current = false;
      }
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  // Quiet fetch for polling (no loading state change)
  const fetchOrdersQuietly = async () => {
    try {
      const response = await fetch("/api/orders/get");
      if (!response.ok) return;
      
      const data = await response.json();
      const fetchedOrders = Array.isArray(data) ? data : [];
      
      // Check for new orders
      const currentOrderIds = new Set(fetchedOrders.map((o: Order) => o.id));
      const newOrders = fetchedOrders.filter(
        (order: Order) => !previousOrderIdsRef.current.has(order.id)
      );
      
      if (newOrders.length > 0) {
        // Trigger notification for each new order
        newOrders.forEach((order: Order) => handleNewOrder(order));
      }
      
      // Update orders and previous IDs
      setOrders(fetchedOrders);
      previousOrderIdsRef.current = currentOrderIds;
      setLastFetchTime(new Date());
      
    } catch (err) {
      console.error("Error fetching orders quietly:", err);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const handleDeleteClick = (order: Order) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/orders?id=${orderToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete order");
      }

      setOrders((prevOrders) => prevOrders.filter((o) => o.id !== orderToDelete.id));
      previousOrderIdsRef.current.delete(orderToDelete.id);
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    } catch (err) {
      console.error("Error deleting order:", err);
      setError(err instanceof Error ? err.message : "Failed to delete order");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
    });
  };

  const getTimeSinceLastFetch = () => {
    if (!lastFetchTime) return "Never";
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - lastFetchTime.getTime()) / 1000);
    
    if (diffInSeconds < 10) return "Just now";
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    return `${Math.floor(diffInSeconds / 60)}m ago`;
  };

  const getTotalItems = (items: OrderItem[]) => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getPaymentIcon = (paymentType?: string) => {
    if (paymentType === "CARD") {
      return <CreditCard className="w-3 h-3" />;
    }
    return <Banknote className="w-3 h-3" />;
  };

  const getPaymentLabel = (paymentType?: string) => {
    return paymentType === "CARD" ? "Card" : "Cash";
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex h-14 shrink-0 items-center gap-3 bg-card border-b border-border">
        <div className="flex items-center gap-3 px-5 w-full justify-between">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink
                    href="#"
                    className="text-muted-foreground hover:text-foreground text-sm"
                  >
                    Order Tracking
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground text-sm font-medium">
                    All Orders
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          
          {/* Last Update Time */}
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Updated {getTimeSinceLastFetch()}
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground text-sm">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-destructive text-sm font-medium mb-2">
              Error loading orders
            </div>
            <p className="text-muted-foreground text-xs">{error}</p>
            <Button onClick={fetchOrders} variant="outline" className="mt-4">
              Retry
            </Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-sm font-medium">No orders yet</p>
            <p className="text-muted-foreground/70 text-xs mt-1">
              Checking for new orders every minute...
            </p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Orders Board</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {orders.length} {orders.length === 1 ? "order" : "orders"} total
                  </p>
                </div>
                <Badge variant="outline" className="px-3 py-1.5 text-sm">
                  <Bell className="w-3.5 h-3.5 mr-1.5 animate-pulse" />
                  Auto-refresh (1 min)
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {orders.map((order) => (
                  <Card
                    key={order.id}
                    className={`bg-card border-border hover:shadow-lg transition-all duration-300 hover:border-primary/50 flex flex-col ${
                      newOrderAnimation === order.id 
                        ? 'animate-[pulse_0.5s_ease-in-out_4] border-primary border-2 shadow-xl shadow-primary/30 scale-105' 
                        : ''
                    }`}
                  >
                    <CardHeader className="pb-3 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="bg-primary/10 rounded-full p-2 shrink-0">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-base text-foreground truncate">
                              {order.customerName || "Guest"}
                            </h3>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                          onClick={() => handleDeleteClick(order)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs px-2 py-0.5">
                          <Package className="w-3 h-3 mr-1" />
                          {getTotalItems(order.items)} items
                        </Badge>
                        <Badge 
                          variant={order.paymentType === "CARD" ? "default" : "outline"} 
                          className="text-xs px-2 py-0.5"
                        >
                          {getPaymentIcon(order.paymentType)}
                          <span className="ml-1">{getPaymentLabel(order.paymentType)}</span>
                        </Badge>
                        {order.Seating && (
                          <Badge variant="outline" className="text-xs px-2 py-0.5">
                            <MapPin className="w-3 h-3 mr-1" />
                            {order.Seating}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col">
                      <div className="space-y-2 flex-1 mb-4">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start justify-between gap-2 p-2.5 bg-muted/50 rounded-lg border border-border/50"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {item.product.name}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                ${item.product.price.toFixed(2)} × {item.quantity}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-semibold text-foreground">
                                ${(item.product.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-border">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                            <DollarSign className="w-4 h-4" />
                            Total
                          </span>
                          <span className="text-xl font-bold text-primary">
                            ${order.subtotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the order for{" "}
              <span className="font-semibold">{orderToDelete?.customerName}</span>?
              This will permanently remove the order and all its items. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
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