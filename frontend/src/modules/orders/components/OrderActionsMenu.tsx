import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MoreVertical,
  Eye,
  Send,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import type { EnrichedOrder } from "../hooks/useOrders";

interface OrderActionsMenuProps {
  order: EnrichedOrder;
  onViewDetail: (order: EnrichedOrder) => void;
}

export const OrderActionsMenu: React.FC<OrderActionsMenuProps> = ({
  order,
  onViewDetail,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleCopyCode = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(order.orderCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback nếu clipboard không khả dụng
    }
    setIsOpen(false);
  };

  const handleDispatch = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    navigate(`/dispatch?orderId=${order.id}`);
  };

  const isPending = order.status === "PENDING";

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        id={`order-menu-${order.id}`}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40"
        title="Thao tác"
        aria-label="Thao tác"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-30 mt-1 w-48 origin-top-right rounded-xl bg-popover border border-border shadow-2xl py-1 animate-in fade-in zoom-in-95 duration-150">
          {/* Xem chi tiết */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onViewDetail(order);
            }}
            className="flex items-center w-full px-3 py-2 text-xs font-medium text-popover-foreground hover:bg-accent hover:text-primary transition-colors text-left"
          >
            <Eye className="w-4 h-4 mr-2.5 text-muted-foreground" />
            Xem chi tiết đơn
          </button>

          {/* Điều phối nếu PENDING */}
          {isPending && (
            <button
              type="button"
              onClick={handleDispatch}
              className="flex items-center w-full px-3 py-2 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors text-left"
            >
              <Send className="w-4 h-4 mr-2.5" />
              Điều phối đơn này
            </button>
          )}

          {/* Nếu đang giao hoặc đã phân công -> xem tại Dispatch */}
          {!isPending && (
            <button
              type="button"
              onClick={handleDispatch}
              className="flex items-center w-full px-3 py-2 text-xs font-medium text-popover-foreground/80 hover:bg-accent hover:text-foreground transition-colors text-left"
            >
              <ExternalLink className="w-4 h-4 mr-2.5 text-muted-foreground" />
              Xem tại Điều phối
            </button>
          )}

          {/* Tra cứu công khai (Dành cho khách hàng) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              window.open(`/track/${order.orderCode}`, "_blank");
            }}
            className="flex items-center w-full px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 transition-colors text-left"
          >
            <ExternalLink className="w-4 h-4 mr-2.5" />
            Tra cứu công khai (Link khách)
          </button>

          {/* Sao chép mã đơn */}
          <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center w-full px-3 py-2 text-xs font-medium text-popover-foreground/80 hover:bg-accent transition-colors text-left"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2.5 text-emerald-500 dark:text-emerald-400" />
                <span className="text-emerald-500 dark:text-emerald-400">Đã sao chép!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2.5 text-muted-foreground" />
                Sao chép mã đơn
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
