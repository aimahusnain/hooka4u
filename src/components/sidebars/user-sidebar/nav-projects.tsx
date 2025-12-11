"use client"

import { QrCode } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import Link from "next/link"

export function HomepageQR() {
  const getHomepageUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/place-new-order`
    }
    return ''
  }

  const getQRCodeUrl = () => {
    const finalUrl = getHomepageUrl()
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(finalUrl)}&bgcolor=ffffff&color=000000&qzone=1&format=svg`
  }

  const finalUrl = getHomepageUrl()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden mt-auto">
      <SidebarGroupLabel className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <QrCode className="h-3.5 w-3.5" />
        QR Code for Ordering Online
      </SidebarGroupLabel>

      <div className="flex flex-col items-center gap-3 px-2 py-3">
        <div className="rounded-lg border-2 border-border bg-white p-3 shadow-sm">
          <img
            draggable="false"
            src={getQRCodeUrl()}
            alt="QR code for ordering online"
            className="h-40 w-40"
          />
        </div>

        <Link
          href={finalUrl}
          className="w-full hover:underline rounded-md bg-muted px-2 py-1.5 text-center"
        >
          <code className="text-[10px] text-wrap text-muted-foreground break-all">
            {finalUrl}
          </code>
        </Link>
      </div>
    </SidebarGroup>
  )
}
