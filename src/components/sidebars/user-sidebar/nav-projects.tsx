"use client"

import { useState } from "react"
import { QrCode } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function HomepageQR() {
  const [qrDialogOpen, setQrDialogOpen] = useState(false)

  const getHomepageUrl = () => {
    return window.location.origin
  }

  const getQRCodeUrl = () => {
    const homepageUrl = getHomepageUrl()
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(homepageUrl)}&bgcolor=ffffff&color=000000&qzone=1&format=svg`
  }

  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => setQrDialogOpen(true)}>
              <QrCode />
              <span>QR Code for Ordering Online</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code for Ordering Online (Guest)
            </DialogTitle>
            <DialogDescription>
              Scan this QR code to visit the homepage on your mobile device
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="rounded-lg border-2 border-border bg-white p-4 shadow-lg">
              <img
              draggable="false"
                src={getQRCodeUrl()}
                alt="QR code for homepage"
                className="h-64 w-64"
              />
            </div>
            <div className="w-full rounded-md bg-muted px-3 py-2 text-center">
              <code className="text-xs text-muted-foreground break-all">
                {getHomepageUrl()}
              </code>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}