import React, { useState, useMemo } from "react";
import {
  FileCheck2,
  ShieldCheck,
  ShieldAlert,
  AlertOctagon,
  Search,
  CheckCircle,
  FileText,
  Building,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import type { CustomsDeclaration } from "../types/international";

interface CustomsDeclarationTableProps {
  declarations: CustomsDeclaration[];
  onUpdateStatus: (id: string, status: string) => void;
  onOpenCreate: () => void;
  isLoading?: boolean;
}

export const CustomsDeclarationTable: React.FC<CustomsDeclarationTableProps> = ({
  declarations,
  onUpdateStatus,
  onOpenCreate,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [channelFilter, setChannelFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredDeclarations = useMemo(() => {
    return declarations.filter((d) => {
      const matchSearch =
        d.declarationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.shipmentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.customsBranch.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.hsCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.commodityDescription.toLowerCase().includes(searchTerm.toLowerCase());

      const matchChannel = channelFilter === "ALL" || d.channel === channelFilter;
      const matchStatus = statusFilter === "ALL" || d.status === statusFilter;

      return matchSearch && matchChannel && matchStatus;
    });
  }, [declarations, searchTerm, channelFilter, statusFilter]);

  const getChannelBadge = (channel: string) => {
    switch (channel) {
      case "GREEN":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px] gap-1 px-2 py-0.5">
            <ShieldCheck className="h-3 w-3" />
            Luồng Xanh (Miễn kiểm)
          </Badge>
        );
      case "YELLOW":
        return (
          <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-[10px] gap-1 px-2 py-0.5">
            <ShieldAlert className="h-3 w-3" />
            Luồng Vàng (Kiểm tra hồ sơ)
          </Badge>
        );
      case "RED":
        return (
          <Badge className="bg-red-500/15 text-red-600 border-red-500/30 text-[10px] gap-1 px-2 py-0.5">
            <AlertOctagon className="h-3 w-3" />
            Luồng Đỏ (Kiểm tra thực tế hàng hóa)
          </Badge>
        );
      default:
        return <Badge variant="outline">{channel}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CLEARED":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] gap-1">
            <CheckCircle className="h-2.5 w-2.5" /> Đã Thông Quan
          </Badge>
        );
      case "REGISTERED":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]">
            Đang Chờ Xử Lý
          </Badge>
        );
      case "DRAFT":
        return (
          <Badge className="bg-muted text-muted-foreground border-border text-[10px]">
            Bản Nháp
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center shadow-2xs">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-xs text-muted-foreground mt-3">Đang truy vấn hệ thống hải quan điện tử VNACCS...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Filter & Action Bar */}
      <div className="bg-card rounded-xl border border-border p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm số tờ khai, mã lô, mã HS, chi cục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 text-xs h-8"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { key: "ALL", label: "Tất cả luồng" },
              { key: "GREEN", label: "Luồng Xanh" },
              { key: "YELLOW", label: "Luồng Vàng" },
              { key: "RED", label: "Luồng Đỏ" },
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={channelFilter === tab.key ? "default" : "outline"}
                size="sm"
                onClick={() => setChannelFilter(tab.key)}
                className="text-xs h-8 px-2.5"
              >
                {tab.label}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pl-2 border-l border-border">
            {[
              { key: "ALL", label: "Mọi trạng thái" },
              { key: "CLEARED", label: "Đã thông quan" },
              { key: "REGISTERED", label: "Chờ xử lý" },
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={statusFilter === tab.key ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setStatusFilter(tab.key)}
                className="text-xs h-8 px-2"
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={onOpenCreate}
            className="text-xs h-8 gap-1.5 bg-primary text-primary-foreground"
          >
            <FileText className="h-3.5 w-3.5" /> Khai Báo Hải Quan Mới
          </Button>
        </div>
      </div>

      {/* Declarations Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                <th className="py-3 px-3.5">Số Tờ Khai & Phân Luồng</th>
                <th className="py-3 px-3.5">Mã Lô Hàng & Loại Hình</th>
                <th className="py-3 px-3.5">Chi Cục Hải Quan Quản Lý</th>
                <th className="py-3 px-3.5">Mã HS & Hàng Hóa</th>
                <th className="py-3 px-3.5 text-right">Trị Giá Hóa Đơn</th>
                <th className="py-3 px-3.5 text-right">Thuế XNK & VAT</th>
                <th className="py-3 px-3.5">Trạng Thái Thông Quan</th>
                <th className="py-3 px-3.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredDeclarations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-muted-foreground">
                    <FileCheck2 className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    Không tìm thấy tờ khai hải quan nào
                  </td>
                </tr>
              ) : (
                filteredDeclarations.map((d) => {
                  const isCleared = d.status === "CLEARED";
                  const totalTax = (d.importTaxAmount || 0) + (d.vatTaxAmount || 0);

                  return (
                    <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                      {/* Declaration No & Channel */}
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-foreground font-mono text-xs">{d.declarationNo}</div>
                        <div className="mt-1">{getChannelBadge(d.channel)}</div>
                      </td>

                      {/* Shipment & Type */}
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-primary font-mono">{d.shipmentCode}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                          Loại hình: {d.declarationType}
                        </div>
                      </td>

                      {/* Branch */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-1 text-foreground font-medium">
                          <Building className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="truncate max-w-[200px]">{d.customsBranch}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          Ngày đ/ký: {d.registeredDate}
                        </div>
                      </td>

                      {/* HS Code & Commodity */}
                      <td className="py-3 px-3.5">
                        <div className="font-mono font-semibold text-foreground text-[11px]">
                          HS: {d.hsCode}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate max-w-[220px] mt-0.5">
                          {d.commodityDescription}
                        </div>
                      </td>

                      {/* Invoice Value */}
                      <td className="py-3 px-3.5 text-right">
                        <div className="font-mono font-bold text-foreground">
                          {d.invoiceValue.toLocaleString()} {d.currency}
                        </div>
                      </td>

                      {/* Taxes */}
                      <td className="py-3 px-3.5 text-right">
                        <div className="font-mono font-bold text-foreground">
                          {totalTax.toLocaleString("vi-VN")} đ
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          Thuế XNK: {d.importTaxAmount.toLocaleString("vi-VN")} đ
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3.5">
                        <div>{getStatusBadge(d.status)}</div>
                        {d.clearedDate && (
                          <div className="text-[10px] text-emerald-600 mt-0.5">
                            {d.clearedDate}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 text-right">
                        {!isCleared ? (
                          <Button
                            size="sm"
                            onClick={() => onUpdateStatus(d.id, "CLEARED")}
                            className="h-7 px-2 text-[11px] gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                            title="Xác nhận cơ quan hải quan đã duyệt thông quan"
                          >
                            <ShieldCheck className="h-3 w-3" /> Thông Quan
                          </Button>
                        ) : (
                          <span className="text-[11px] text-emerald-600 inline-flex items-center gap-1 font-medium">
                            <CheckCircle className="h-3 w-3" /> Đã duyệt
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
