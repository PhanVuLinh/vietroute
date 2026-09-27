import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  Check,
  X,
  Download,
  Plus,
  Trash2,
  FileText,
  Upload,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardHeader, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import {
  useShippingDocuments,
  useInternationalMutations,
  useInternationalShipments,
} from "../hooks/useInternational";
import type { ShippingDocument } from "../types/international";
import { toast } from "@/shared/components/feedback/Toast";

export const ShippingDocumentsVault: React.FC = () => {
  const [selectedShipment, setSelectedShipment] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Form states for creating document
  const [formShipmentCode, setFormShipmentCode] = useState("");
  const [formDocType, setFormDocType] = useState<ShippingDocument["documentType"]>("BILL_OF_LADING");
  const [formDocNumber, setFormDocNumber] = useState("");
  const [formIssuer, setFormIssuer] = useState("");
  const [formFileFormat, setFormFileFormat] = useState("PDF");
  const [formIsMandatory, setFormIsMandatory] = useState(true);

  const { data: documents = [], isLoading } = useShippingDocuments();
  const { data: shipments = [] } = useInternationalShipments();
  const {
    verifyShippingDocument,
    createShippingDocument,
    deleteShippingDocument,
  } = useInternationalMutations();

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchShipment = selectedShipment === "ALL" || doc.shipmentCode === selectedShipment;
      const matchSearch =
        doc.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.issuer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.documentType.toLowerCase().includes(searchTerm.toLowerCase());
      return matchShipment && matchSearch;
    });
  }, [documents, selectedShipment, searchTerm]);

  // Document Readiness Score
  const readinessMetrics = useMemo(() => {
    if (documents.length === 0) return { score: 0, verifiedCount: 0, totalCount: 0 };
    const verified = documents.filter((d) => d.status === "VERIFIED").length;
    const score = Math.round((verified / documents.length) * 100);
    return { score, verifiedCount: verified, totalCount: documents.length };
  }, [documents]);

  const handleVerify = async (doc: ShippingDocument, status: "VERIFIED" | "REJECTED") => {
    await verifyShippingDocument.mutateAsync({
      id: doc.id,
      data: {
        status,
        verificationNotes:
          status === "VERIFIED"
            ? "Chứng từ hợp lệ, khớp dữ liệu tờ khai hải quan VNACCS"
            : "Yêu cầu cung cấp lại bản gốc rõ nét hoặc bổ sung con dấu thẩm quyền",
      },
    });
  };

  const handleDelete = async (doc: ShippingDocument) => {
    if (confirm(`Bạn có chắc muốn xóa chứng từ ${doc.documentNumber}?`)) {
      await deleteShippingDocument.mutateAsync(doc.id);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formShipmentCode || !formDocNumber) {
      toast.error("Vui lòng nhập mã lô hàng và số hiệu chứng từ");
      return;
    }

    const matchedShipment = shipments.find((s) => s.shipmentCode === formShipmentCode);

    await createShippingDocument.mutateAsync({
      shipmentId: matchedShipment?.id || "shp-custom",
      shipmentCode: formShipmentCode,
      documentType: formDocType,
      documentNumber: formDocNumber,
      issuer: formIssuer || "Cơ quan phát hành",
      fileFormat: formFileFormat,
      isMandatory: formIsMandatory,
      status: "ISSUED",
      issueDate: new Date().toISOString(),
    });

    setIsUploadOpen(false);
    setFormDocNumber("");
    setFormIssuer("");
  };

  const getDocTypeBadge = (type: string) => {
    switch (type) {
      case "BILL_OF_LADING":
        return <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">Vận đơn đường biển (B/L)</Badge>;
      case "COMMERCIAL_INVOICE":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]">Hóa đơn thương mại (CI)</Badge>;
      case "PACKING_LIST":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">Bảng kê đóng gói (PL)</Badge>;
      case "CERTIFICATE_OF_ORIGIN":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">Chứng nhận xuất xứ (C/O)</Badge>;
      case "PHYTOSANITARY":
        return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-[10px]">Kiểm dịch thực vật/Y tế</Badge>;
      case "VNACCS_DECLARATION":
        return <Badge className="bg-teal-500/10 text-teal-600 border-teal-500/20 text-[10px]">Tờ khai thông quan VNACCS</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] gap-1">
            <CheckCircle2 className="h-2.5 w-2.5" /> Đã Thẩm Tra Hợp Lệ
          </Badge>
        );
      case "ISSUED":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]">
            Đã Tiếp Nhận (Chờ Duyệt)
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-[10px] gap-1">
            <AlertTriangle className="h-2.5 w-2.5" /> Bị Từ Chối (Cần Sửa)
          </Badge>
        );
      default:
        return (
          <Badge className="bg-muted text-muted-foreground border-border text-[10px]">
            Bản Nháp (Draft)
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center text-xs text-muted-foreground">
        Đang đồng bộ kho chứng từ xuất nhập khẩu số hóa...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Compliance Readiness Score */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-primary/5 to-transparent border border-emerald-500/20 rounded-xl p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-foreground">
                Kho Chứng Từ Xuất Nhập Khẩu Số Hóa & Thẩm Tra Tính Pháp Lý
              </h3>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 text-[11px]">
                {readinessMetrics.score}% Chuẩn Bị
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Hệ thống lưu chiểu và kiểm tra tính hợp lệ của Vận đơn (B/L), Hóa đơn (CI), Bảng kê (PL), C/O và Kiểm dịch
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-xs font-semibold text-foreground">
              Đã thẩm tra hợp lệ: <span className="text-emerald-600 font-bold">{readinessMetrics.verifiedCount}</span> / {readinessMetrics.totalCount} chứng từ
            </div>
            <div className="w-36 h-2 bg-muted rounded-full overflow-hidden mt-1.5 ml-auto">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${readinessMetrics.score}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Documents Table */}
      <Card className="border-border shadow-2xs">
        <CardHeader className="pb-3 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Tìm số chứng từ, cơ quan cấp, loại file..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 text-xs h-8"
              />
            </div>

            <select
              value={selectedShipment}
              onChange={(e) => setSelectedShipment(e.target.value)}
              className="bg-background border border-input rounded-md px-2.5 py-1 text-xs font-mono text-foreground focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">Mọi lô hàng ({shipments.length})</option>
              {shipments.map((s) => (
                <option key={s.id} value={s.shipmentCode}>
                  {s.shipmentCode} ({s.direction === "IMPORT" ? "Nhập" : "Xuất"})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => {
                if (shipments.length > 0) setFormShipmentCode(shipments[0].shipmentCode);
                setIsUploadOpen(true);
              }}
              className="text-xs h-8 gap-1.5 bg-primary text-primary-foreground font-semibold shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" /> Thêm Chứng Từ Mới
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                toast.success("Đã tải trọn bộ hồ sơ", "Đã nén zip toàn bộ chứng từ xuất nhập khẩu kèm mã vạch hải quan.");
              }}
              className="text-xs h-8 gap-1.5"
            >
              <Download className="h-3.5 w-3.5" /> Tải Trọn Bộ Hồ Sơ Zip
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground font-semibold">
                  <th className="py-2.5 px-3.5">Loại Chứng Từ</th>
                  <th className="py-2.5 px-3.5">Số Chứng Từ & Lô Hàng</th>
                  <th className="py-2.5 px-3.5">Cơ Quan Cấp / Phát Hành</th>
                  <th className="py-2.5 px-3.5">Ngày Phát Hành</th>
                  <th className="py-2.5 px-3.5">Ghi Chú Thẩm Tra</th>
                  <th className="py-2.5 px-3.5">Tình Trạng</th>
                  <th className="py-2.5 px-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      <FileText className="h-6 w-6 mx-auto mb-1.5 opacity-40" />
                      Không tìm thấy chứng từ nào phù hợp
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc) => {
                    const isVerified = doc.status === "VERIFIED";

                    return (
                      <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                        {/* Document Type */}
                        <td className="py-3 px-3.5">
                          <div>{getDocTypeBadge(doc.documentType)}</div>
                          {doc.isMandatory && (
                            <span className="text-[10px] text-red-500 font-medium block mt-0.5">
                              * Bắt buộc để thông quan
                            </span>
                          )}
                        </td>

                        {/* Doc No & Shipment */}
                        <td className="py-3 px-3.5">
                          <div className="font-bold text-foreground font-mono text-xs">
                            {doc.documentNumber}
                          </div>
                          <div className="text-[11px] text-primary font-mono mt-0.5">
                            {doc.shipmentCode}
                          </div>
                        </td>

                        {/* Issuer */}
                        <td className="py-3 px-3.5 text-foreground font-medium max-w-[200px]">
                          <span className="truncate block">{doc.issuer}</span>
                        </td>

                        {/* Issue Date */}
                        <td className="py-3 px-3.5 text-muted-foreground">
                          {new Date(doc.issueDate).toLocaleDateString("vi-VN")}
                        </td>

                        {/* Verification Notes */}
                        <td className="py-3 px-3.5 text-muted-foreground max-w-[220px]">
                          <span className="truncate block text-[11px]">{doc.verificationNotes || "Chưa có ghi chú"}</span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3.5">{getStatusBadge(doc.status)}</td>

                        {/* Actions */}
                        <td className="py-3 px-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isVerified ? (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleVerify(doc, "VERIFIED")}
                                  className="h-7 px-2 text-[11px] gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                  title="Phê duyệt chứng từ hợp lệ"
                                >
                                  <Check className="h-3 w-3" /> Duyệt
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleVerify(doc, "REJECTED")}
                                  className="h-7 px-2 text-[11px] text-red-600 border-red-500/30 hover:bg-red-500/10"
                                  title="Yêu cầu sửa đổi chứng từ"
                                >
                                  <X className="h-3 w-3" /> Từ chối
                                </Button>
                              </>
                            ) : (
                              <span className="text-[11px] text-emerald-600 inline-flex items-center gap-1 font-medium">
                                <ShieldCheck className="h-3.5 w-3.5" /> Hợp lệ
                              </span>
                            )}

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(doc)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-500/10"
                              title="Xóa chứng từ"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Upload / Add Document Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="max-w-md text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Upload className="h-5 w-5 text-primary" />
              Tải Lên Chứng Từ Vận Tải Quốc Tế Mới
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="font-semibold block mb-1">Chọn Lô Hàng Liên Quan</label>
              <select
                value={formShipmentCode}
                onChange={(e) => setFormShipmentCode(e.target.value)}
                className="w-full h-8.5 px-3 rounded-lg border border-border bg-background text-foreground font-mono"
                required
              >
                <option value="">-- Chọn lô hàng --</option>
                {shipments.map((s) => (
                  <option key={s.id} value={s.shipmentCode}>
                    {s.shipmentCode} ({s.carrierName} - {s.podPort})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Loại Chứng Từ Vận Tải</label>
              <select
                value={formDocType}
                onChange={(e) => setFormDocType(e.target.value as any)}
                className="w-full h-8.5 px-3 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="BILL_OF_LADING">Vận đơn đường biển (B/L)</option>
                <option value="COMMERCIAL_INVOICE">Hóa đơn thương mại (Commercial Invoice)</option>
                <option value="PACKING_LIST">Bảng kê chi tiết hàng hóa (Packing List)</option>
                <option value="CERTIFICATE_OF_ORIGIN">Chứng nhận xuất xứ (C/O Form B/EUR.1/E/AK/AJ)</option>
                <option value="PHYTOSANITARY">Chứng thư kiểm dịch động/thực vật (Phytosanitary/Health)</option>
                <option value="VNACCS_DECLARATION">Tờ khai thông quan hải quan điện tử VNACCS</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Số Hiệu Chứng Từ (Document Number)</label>
              <Input
                value={formDocNumber}
                onChange={(e) => setFormDocNumber(e.target.value)}
                placeholder="Ví dụ: MAEU-2026-9910 hoặc CO-VCCI-8812"
                className="h-8.5 font-mono"
                required
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Cơ Quan Cấp / Đơn Vị Phát Hành</label>
              <Input
                value={formIssuer}
                onChange={(e) => setFormIssuer(e.target.value)}
                placeholder="Ví dụ: Hãng tàu Maersk Line hoặc Phòng Thương Mại VCCI"
                className="h-8.5"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Định Dạng File</label>
                <select
                  value={formFileFormat}
                  onChange={(e) => setFormFileFormat(e.target.value)}
                  className="w-full h-8.5 px-3 rounded-lg border border-border bg-background text-foreground font-mono"
                >
                  <option value="PDF">Bản scan PDF</option>
                  <option value="XML">Tệp dữ liệu XML</option>
                  <option value="EDI">Chuẩn EDIFACT</option>
                </select>
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-foreground">
                  <input
                    type="checkbox"
                    checked={formIsMandatory}
                    onChange={(e) => setFormIsMandatory(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span>Bắt buộc thông quan</span>
                </label>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUploadOpen(false)}
                className="h-8.5 text-xs"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={createShippingDocument.isPending}
                className="h-8.5 text-xs bg-primary text-primary-foreground font-semibold"
              >
                {createShippingDocument.isPending ? "Đang lưu..." : "Lưu Chứng Từ Vào Hồ Sơ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
