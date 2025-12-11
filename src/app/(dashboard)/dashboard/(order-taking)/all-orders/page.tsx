"use client";
import { useState, useEffect, useRef } from "react";
import {
  Loader2,
  ShoppingBag,
  Clock,
  User,
  Package,
  DollarSign,
  Calendar,
  CreditCard,
  Banknote,
  MapPin,
  Trash2,
  Bell,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
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
  status?: "PENDING" | "DELIVERED";
}

export default function AllOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [newOrderAnimation, setNewOrderAnimation] = useState<string | null>(
    null
  );
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousOrderIdsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    audioRef.current = new Audio(
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYHGWe77OVvSxMLT6Xl8Lhb"
    );

    fetchOrders();
    requestNotificationPermission();

    const pollInterval = setInterval(() => {
      fetchOrdersQuietly();
    }, 60000);

    return () => {
      clearInterval(pollInterval);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleNewOrder = (newOrder: Order) => {
    playNotificationSound();

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("🔔 New Order Received!", {
        body: `Order from ${
          newOrder.customerName || "Guest"
        } - $${newOrder.subtotal.toFixed(2)}`,
        icon: "/notification-icon.png",
        badge: "/badge-icon.png",
        tag: newOrder.id,
      });
    }

    setNewOrderAnimation(newOrder.id);
    setTimeout(() => setNewOrderAnimation(null), 3000);
  };

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => {
        console.log("Could not play notification sound:", err);
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

      if (isInitialLoadRef.current) {
        previousOrderIdsRef.current = new Set(
          fetchedOrders.map((o: Order) => o.id)
        );
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

  const fetchOrdersQuietly = async () => {
    try {
      const response = await fetch("/api/orders/get");
      if (!response.ok) return;

      const data = await response.json();
      const fetchedOrders = Array.isArray(data) ? data : [];

      const currentOrderIds = new Set(fetchedOrders.map((o: Order) => o.id));
      const newOrders = fetchedOrders.filter(
        (order: Order) => !previousOrderIdsRef.current.has(order.id)
      );

      if (newOrders.length > 0) {
        newOrders.forEach((order: Order) => handleNewOrder(order));
      }

      setOrders(fetchedOrders);
      previousOrderIdsRef.current = currentOrderIds;
      setLastFetchTime(new Date());
    } catch (err) {
      console.error("Error fetching orders quietly:", err);
    }
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
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

      setOrders((prevOrders) =>
        prevOrders.filter((o) => o.id !== orderToDelete.id)
      );
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
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const getTimeSinceLastFetch = () => {
    if (!lastFetchTime) return "Never";
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - lastFetchTime.getTime()) / 1000
    );

    if (diffInSeconds < 10) return "Just now";
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    return `${Math.floor(diffInSeconds / 60)}m ago`;
  };

  const getTotalItems = (items: OrderItem[]) => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleStatusToggle = async (order: Order) => {
    const newStatus = order.status === "DELIVERED" ? "PENDING" : "DELIVERED";

    try {
      setUpdatingStatus(order.id);
      const response = await fetch(`/api/orders/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.id,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o.id === order.id ? { ...o, status: newStatus } : o
        )
      );
    } catch (err) {
      console.error("Error updating order status:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update order status"
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  const pendingOrders = orders.filter(
    (o) => !o.status || o.status === "PENDING"
  );
  const deliveredOrders = orders.filter((o) => o.status === "DELIVERED");
  
  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center gap-3 bg-card border-b border-border">
        <div className="flex items-center gap-2 md:gap-3 px-3 md:px-5 w-full justify-between">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <SidebarTrigger className="hidden sm:flex -ml-1 text-muted-foreground hover:text-foreground" />
            <Separator orientation="vertical" className="h-4 bg-border hidden sm:block" />
            <Breadcrumb className="min-w-0">
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink
                    href="#"
                    className="text-muted-foreground hover:text-foreground text-sm"
                  >
                    Order Tracking
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block text-muted-foreground" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground text-sm font-medium truncate">
                    All Orders
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <Clock className="w-3.5 h-3.5 hidden sm:block" />
              <span className="hidden sm:inline">Updated {getTimeSinceLastFetch()}</span>
              <span className="sm:hidden">{getTimeSinceLastFetch()}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
            <p className="text-muted-foreground text-sm">Loading orders</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full px-4">
            <AlertCircle className="w-10 h-10 text-destructive mb-3" />
            <div className="text-destructive text-sm font-medium mb-1">
              Error loading orders
            </div>
            <p className="text-muted-foreground text-xs mb-4">{error}</p>
            <Button
              onClick={fetchOrders}
              variant="outline"
              className="bg-card border-border hover:bg-accent text-foreground"
            >
              Retry
            </Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <ShoppingBag className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <p className="text-white text-sm font-medium">No orders</p>
            <p className="text-muted-foreground text-xs mt-1">
              Waiting for new orders...
            </p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="p-3 md:p-6">
              {/* Stats */}
              <div className="grid grid-cols-2 md:flex md:gap-3 gap-2 mb-4 md:mb-6">
                <div className="md:w-32 bg-card border border-border p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Total
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {orders.length}
                  </div>
                </div>
                <div className="md:w-32 bg-card border border-border p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Pending
                  </div>
                  <div className="text-2xl font-bold text-amber-500 dark:text-amber-400">
                    {pendingOrders.length}
                  </div>
                </div>
                <div className="md:w-32 bg-card border border-border p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Delivered
                  </div>
                  <div className="text-2xl font-bold text-emerald-500 dark:text-emerald-400">
                    {deliveredOrders.length}
                  </div>
                </div>
                <div className="md:w-32 bg-card border border-border p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Total Sales
                  </div>
                  <div className="text-2xl font-bold text-blue-500 dark:text-blue-400">
                    ${orders.reduce((sum, order) => sum + order.subtotal, 0).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Orders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {orders.map((order) => {
                  const isDelivered = order.status === "DELIVERED";
                  const isVIP = order.Seating?.toUpperCase().includes("VIP");

                  return (
                    <Card
                      key={order.id}
                      className={`group bg-black border hover:border-primary/50 transition-all duration-200 flex flex-col ${
                        newOrderAnimation === order.id
                          ? "animate-[pulse_0.5s_ease-in-out_4] border-blue-500"
                          : "border-border"
                      }`}
                    >
                      <CardHeader className="pb-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-10 h-10 bg-muted flex items-center justify-center shrink-0 rounded">
                              <User className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-md text-white truncate">
                                  {order.customerName || "Guest"}
                                </h3>
                                {isVIP && (
                                  <Badge className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 text-xs px-1.5 py-0 border-amber-300 dark:border-amber-800">
                                    VIP
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteClick(order)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className="text-xs border-border bg-muted text-foreground"
                          >
                            {getTotalItems(order.items)} items
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-md uppercase font-bold border-border px-3 py-1 ${
                              order.paymentType === "CARD"
                                ? "bg-muted text-foreground"
                                : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
                            }`}
                          >
                            {order.paymentType === "CARD" ? (
                              <CreditCard className="w-4 h-4 mr-1.5" />
                            ) : (
                              <Banknote className="w-4 h-4 mr-1.5" />
                            )}
                            {order.paymentType === "CARD" ? "Card" : "Cash"}
                          </Badge>
                          {order.Seating && (
                            <Badge
                              variant="outline"
                              className="text-md border-border bg-muted text-muted-foreground"
                            >
                              <MapPin className="w-3 h-3 mr-1" />
                              {order.Seating}
                            </Badge>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div className="pt-2">
                          <Badge
                            variant="outline"
                            className={`text-xs font-medium ${
                              isDelivered
                                ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
                                : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800"
                            }`}
                          >
                            {isDelivered ? "DELIVERED" : "PENDING"}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="flex-1 flex flex-col">
                        <div className="space-y-2 flex-1 mb-4">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-start justify-between gap-2 p-2.5 bg-muted border border-border rounded"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-foreground truncate">
                                  {item.product.name}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  ${item.product.price.toFixed(2)} ×{" "}
                                  {item.quantity}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-sm font-semibold text-foreground">
                                  $
                                  {(item.product.price * item.quantity).toFixed(
                                    2
                                  )}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-3 border-t border-border space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground uppercase tracking-wider">
                              Total
                            </span>
                            <span className="text-xl font-bold text-white">
                              ${order.subtotal.toFixed(2)}
                            </span>
                          </div>

                          <Button
                            onClick={() => handleStatusToggle(order)}
                            disabled={updatingStatus === order.id}
                            className={`w-full font-medium transition-all ${
                              isDelivered
                                ? "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white"
                                : "bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700 text-white"
                            }`}
                          >
                            {updatingStatus === order.id ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Updating
                              </>
                            ) : isDelivered ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Delivered
                              </>
                            ) : (
                              "Mark Delivered"
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border w-[calc(100%-2rem)] max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Delete Order
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete the order for{" "}
              <span className="font-semibold text-foreground">
                {orderToDelete?.customerName}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel
              disabled={deleting}
              className="bg-muted border-border hover:bg-accent text-foreground mt-0"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground mt-0"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting
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