import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  CheckCircle2,
  Download,
  Send,
  Sparkles,
  Package,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { toast } from '@/shared/components/feedback/Toast';
import type { B2BBulkOrderItem } from '../../types/b2bPortal';

interface B2BBulkOrderBatchProps {
  onSubmitBatch: (orders: B2BBulkOrderItem[]) => Promise<boolean>;
  isSubmitting: boolean;
}

const SAMPLE_BULK_ORDERS: B2BBulkOrderItem[] = [
  {
    id: 'row-1',
    customerReference: 'PO-2026-9901',
    receiverName: 'Siêu thị Big C Miền Đông',
    receiverPhone: '0908 123 456',
    receiverAddress: '268 Tô Hiến Thành, Phường 15, Quận 10, TP. HCM',
    weight: 850,
    codAmount: 0,
    notes: 'Giao trong giờ hành chính, bảo quản mát 18°C',
    isValid: true,
  },
  {
    id: 'row-2',
    customerReference: 'PO-2026-9902',
    receiverName: 'Đại lý Sữa Hoàng Gia',
    receiverPhone: '0913 888 999',
    receiverAddress: '15 Nguyễn Thị Minh Khai, Phường Bến Nghé, Quận 1, TP. HCM',
    weight: 420,
    codAmount: 0,
    notes: 'Ký nhận biên bản giao hàng 3 liên',
    isValid: true,
  },
  {
    id: 'row-3',
    customerReference: 'PO-2026-9903',
    receiverName: 'Trung Tâm Phân Phối Masan Đồng Nai',
    receiverPhone: '0977 456 789',
    receiverAddress: 'KCN Biên Hòa 2, TP. Biên Hòa, Đồng Nai',
    weight: 2100,
    codAmount: 0,
    notes: 'Xe tải trên 5 tấn có bửng nâng thủy lực',
    isValid: true,
  },
  {
    id: 'row-4',
    customerReference: 'PO-2026-9904',
    receiverName: 'Bách Hóa Xanh Gò Vấp 12',
    receiverPhone: '0934 567 890',
    receiverAddress: '78 Quang Trung, Phường 10, Q. Gò Vấp, TP. HCM',
    weight: 350,
    codAmount: 0,
    notes: 'Hàng dễ vỡ, không xếp quá 4 lớp',
    isValid: true,
  },
  {
    id: 'row-5',
    customerReference: 'PO-2026-9905',
    receiverName: 'Kho Tổng Hợp Dược Phẩm Cần Thơ',
    receiverPhone: '0903 234 567',
    receiverAddress: '12 Võ Nguyên Giáp, P. Phú Thứ, Q. Cái Răng, TP. Cần Thơ',
    weight: 1250,
    codAmount: 0,
    notes: 'Kiện hàng chuẩn GDP y tế',
    isValid: true,
  },
];

export const B2BBulkOrderBatch: React.FC<B2BBulkOrderBatchProps> = ({
  onSubmitBatch,
  isSubmitting,
}) => {
  const [orders, setOrders] = useState<B2BBulkOrderItem[]>(SAMPLE_BULK_ORDERS);

  // Thêm 1 dòng trống
  const handleAddRow = () => {
    const newRow: B2BBulkOrderItem = {
      id: `row-${Date.now()}`,
      customerReference: `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      receiverName: '',
      receiverPhone: '',
      receiverAddress: '',
      weight: 100,
      codAmount: 0,
      notes: '',
      isValid: false,
    };
    setOrders([...orders, newRow]);
  };

  // Nạp dữ liệu mẫu nhanh
  const handleLoadSample = () => {
    setOrders(SAMPLE_BULK_ORDERS);
    toast.success('Đã nạp 5 đơn hàng mẫu', 'Bạn có thể chỉnh sửa các trường trước khi gửi');
  };

  // Xóa 1 dòng
  const handleDeleteRow = (id: string) => {
    if (orders.length <= 1) {
      toast.info('Tối thiểu 1 đơn', 'Danh sách lô hàng cần ít nhất 1 kiện.');
      return;
    }
    setOrders(orders.filter((o) => o.id !== id));
  };

  // Cập nhật giá trị trường
  const handleUpdateField = (id: string, field: keyof B2BBulkOrderItem, value: any) => {
    setOrders(
      orders.map((o) => {
        if (o.id === id) {
          const updated = { ...o, [field]: value };
          // Kiểm tra tính hợp lệ cơ bản
          const isValid =
            Boolean(updated.receiverName?.trim()) &&
            Boolean(updated.receiverPhone?.trim()) &&
            Boolean(updated.receiverAddress?.trim()) &&
            Number(updated.weight) > 0;
          return { ...updated, isValid };
        }
        return o;
      })
    );
  };

  // Tải file mẫu CSV
  const handleDownloadTemplate = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'MaThamChieu,NguoiNhan,SoDienThoai,DiaChiGiaoHang,KhoiLuongKg,TienCOD,GhiChu\n' +
      'PO-001,Sieu thi Mega Market,0901234567,Khu B An Phu An Khanh TP Thu Duc,1200,0,Giao buoi sang\n' +
      'PO-002,Dai ly Tan Binh,0987654321,12 Hoang Hoa Tham Tan Binh TP HCM,450,0,Hang de vo\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'vietroute_b2b_bulk_order_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Đã tải file mẫu', 'vietroute_b2b_bulk_order_template.csv');
  };

  // Kiểm tra toàn bộ danh sách hợp lệ
  const totalWeight = orders.reduce((sum, o) => sum + (Number(o.weight) || 0), 0);
  const invalidCount = orders.filter((o) => !o.receiverName || !o.receiverPhone || !o.receiverAddress || !o.weight).length;

  const handleSubmit = async () => {
    if (invalidCount > 0) {
      toast.error('Thiếu thông tin', `Còn ${invalidCount} kiện hàng chưa điền đủ người nhận, SĐT hoặc địa chỉ!`);
      return;
    }
    await onSubmitBatch(orders);
  };

  return (
    <div className="space-y-5">
      {/* Upload Zone & Actions Bar */}
      <Card className="border-border/80 shadow-xs">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">
                  Ký Gửi Lô Hàng B2B Hàng Loạt (Bulk Order Batch)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Hỗ trợ nhập trực tiếp vào bảng hoặc tải lên tệp Excel / CSV để hệ thống tự động sinh vận đơn và phân tuyến.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                className="h-8 text-xs gap-1.5 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                Tải file mẫu Excel (.CSV)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadSample}
                className="h-8 text-xs gap-1.5 cursor-pointer text-amber-600 border-amber-500/30 hover:bg-amber-500/10"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Nạp 5 đơn mẫu B2B
              </Button>
              <Button
                size="sm"
                onClick={handleAddRow}
                className="h-8 text-xs gap-1.5 cursor-pointer bg-slate-800 hover:bg-slate-900 text-white"
              >
                <Plus className="h-3.5 w-3.5" />
                Thêm dòng
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editable Batch Data Table */}
      <Card className="border-border/80 shadow-sm overflow-hidden">
        <CardHeader className="py-3 px-4 bg-muted/40 border-b border-border/60 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-bold text-foreground">
              Danh sách kiện hàng trong lô ({orders.length} kiện)
            </CardTitle>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-muted-foreground">
              Tổng khối lượng:{' '}
              <strong className="text-foreground">{totalWeight.toLocaleString('vi-VN')} kg</strong>
            </span>
            {invalidCount > 0 ? (
              <Badge variant="destructive" className="text-[10px] font-semibold">
                {invalidCount} dòng chưa hoàn thiện
              </Badge>
            ) : (
              <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px] font-semibold">
                <CheckCircle2 className="h-3 w-3 mr-1 inline" /> 100% Hợp lệ
              </Badge>
            )}
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] font-bold border-b border-border/60">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3 w-32">Mã đơn khách</th>
                <th className="py-2.5 px-3 w-48">Người nhận / Đại lý</th>
                <th className="py-2.5 px-3 w-32">Số điện thoại</th>
                <th className="py-2.5 px-3 min-w-[260px]">Địa chỉ giao hàng</th>
                <th className="py-2.5 px-3 w-28 text-right">Khối lượng (kg)</th>
                <th className="py-2.5 px-3 w-28 text-right">Thu hộ COD (đ)</th>
                <th className="py-2.5 px-3 min-w-[200px]">Ghi chú yêu cầu</th>
                <th className="py-2.5 px-3 w-12 text-center">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {orders.map((item, idx) => (
                <tr
                  key={item.id}
                  className="hover:bg-muted/30 transition-colors group"
                >
                  <td className="py-2 px-3 text-center text-muted-foreground font-mono">
                    {idx + 1}
                  </td>
                  <td className="py-2 px-3">
                    <Input
                      value={item.customerReference}
                      onChange={(e) => handleUpdateField(item.id, 'customerReference', e.target.value)}
                      placeholder="PO-2026-..."
                      className="h-8 text-xs font-mono"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <Input
                      value={item.receiverName}
                      onChange={(e) => handleUpdateField(item.id, 'receiverName', e.target.value)}
                      placeholder="Tên đại lý / người nhận *"
                      className={`h-8 text-xs ${!item.receiverName ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                    />
                  </td>
                  <td className="py-2 px-3">
                    <Input
                      value={item.receiverPhone}
                      onChange={(e) => handleUpdateField(item.id, 'receiverPhone', e.target.value)}
                      placeholder="09xx xxx xxx *"
                      className={`h-8 text-xs font-mono ${!item.receiverPhone ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                    />
                  </td>
                  <td className="py-2 px-3">
                    <Input
                      value={item.receiverAddress}
                      onChange={(e) => handleUpdateField(item.id, 'receiverAddress', e.target.value)}
                      placeholder="Số nhà, đường, quận/huyện, tỉnh/thành *"
                      className={`h-8 text-xs ${!item.receiverAddress ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                    />
                  </td>
                  <td className="py-2 px-3">
                    <Input
                      type="number"
                      value={item.weight}
                      onChange={(e) => handleUpdateField(item.id, 'weight', Number(e.target.value))}
                      placeholder="0"
                      className="h-8 text-xs text-right font-mono"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <Input
                      type="number"
                      value={item.codAmount || 0}
                      onChange={(e) => handleUpdateField(item.id, 'codAmount', Number(e.target.value))}
                      placeholder="0"
                      className="h-8 text-xs text-right font-mono"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <Input
                      value={item.notes || ''}
                      onChange={(e) => handleUpdateField(item.id, 'notes', e.target.value)}
                      placeholder="Ghi chú bảo quản..."
                      className="h-8 text-xs"
                    />
                  </td>
                  <td className="py-2 px-3 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRow(item.id)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Summary & Submit */}
        <div className="p-4 bg-muted/20 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            Bằng việc gửi lô hàng, bạn xác nhận đã kiểm tra quy cách đóng gói và thỏa thuận vận tải B2B.
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="default"
              onClick={handleSubmit}
              disabled={isSubmitting || orders.length === 0}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md cursor-pointer gap-2 h-10 px-6 text-xs"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Đang tạo vận đơn...' : `Xác Nhận Ký Gửi Lô Hàng (${orders.length} Kiện)`}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
