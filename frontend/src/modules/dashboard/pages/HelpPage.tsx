import React, { useState } from "react";
import {
  BookOpen,
  HelpCircle,
  Phone,
  Mail,
  ChevronDown,
  ChevronRight,
  Package,
  Route,
  Truck,
  Radio,
  Search,
  MessageSquare,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";

interface FaqItem {
  question: string;
  answer: string;
  category: "DISPATCH" | "FLEET" | "GPS" | "SYSTEM";
}

const FAQS: FaqItem[] = [
  {
    question: "Làm thế nào để thuật toán tự động sắp xếp thứ tự các điểm dừng trên tuyến đường?",
    answer:
      "Khi tạo hoặc sửa tuyến đường tại màn hình [Tuyến đường (/routes)], sau khi nhập danh sách các địa chỉ dừng, bạn chỉ cần bấm nút 'Tối ưu hóa thứ tự chặng (AI Optimize)'. Thuật toán Dijkstra & Heuristic của VietRoute sẽ tính toán ma trận khoảng cách và sắp xếp lại các trạm sao cho tổng quãng đường và thời gian ngắn nhất.",
    category: "DISPATCH",
  },
  {
    question: "Xử lý như thế nào khi xe vận chuyển gặp sự cố hỏng hóc hoặc vi phạm tốc độ?",
    answer:
      "Khi có sự cố kỹ thuật hoặc cảnh báo đỏ trên màn hình [Giám sát GPS (/tracking)], điều phối viên có thể bấm trực tiếp vào biểu tượng xe để xem bảng Telematics, nhấn nút 'Gọi tài xế' để nắm bắt tình hình. Nếu cần thay thế phương tiện khẩn cấp, hãy vào [Điều phối (/dispatch)] để điều chuyển các đơn hàng còn lại sang phương tiện rảnh rỗi gần nhất.",
    category: "FLEET",
  },
  {
    question: "Quy định cảnh báo hạn đăng kiểm phương tiện hoạt động ra sao?",
    answer:
      "Hệ thống tự động phân loại 3 trạng thái đăng kiểm: Còn hạn (Xanh lá), Sắp hết hạn trong vòng 30 ngày (Vàng), và Quá hạn (Đỏ - Nghiêm cấm xuất bến). Bạn có thể xem danh sách và xuất biên bản nhắc nhở tại màn hình [Đội xe (/fleet)].",
    category: "FLEET",
  },
  {
    question: "Làm thế nào để chuyển đổi giữa chế độ dữ liệu giả lập (Mock) và Backend API thật?",
    answer:
      "Vào trang [Cài đặt hệ thống (/settings)] > Tab 'Kết nối API & Backend'. Tại đây bạn có thể kiểm tra trạng thái Microservices qua nút 'Kiểm tra (Ping)'. Để chuyển sang Backend thật, quản trị viên chỉ cần đặt biến môi trường VITE_USE_MOCK=false trong file cấu hình .env của dự án.",
    category: "SYSTEM",
  },
  {
    question: "Dữ liệu định vị GPS được cập nhật với tần suất bao lâu một lần?",
    answer:
      "Trong chế độ giám sát trực tuyến thời gian thực, thiết bị IoT gắn trên phương tiện truyền tọa độ, vận tốc và góc lái về máy chủ định kỳ 2 giây/lần. Bạn có thể tăng tốc độ mô phỏng lên 2x hoặc 5x bằng thanh điều khiển tốc độ ở đầu trang Giám sát.",
    category: "GPS",
  },
  {
    question: "Cách tải và xuất báo cáo hiệu suất giao hàng định dạng Excel hoặc PDF?",
    answer:
      "Truy cập vào trang [Báo cáo & Phân tích (/reports)], chọn khung thời gian (Hôm nay, 7 ngày, 30 ngày qua) và bấm nút 'Xuất báo cáo' ở góc trên bên phải để tải tệp dữ liệu chi tiết.",
    category: "DISPATCH",
  },
];

export const HelpPage: React.FC = () => {
  usePageTitle("Trung tâm trợ giúp");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const filteredFaqs = FAQS.filter((faq) => {
    const matchCategory = selectedCategory === "ALL" || faq.category === selectedCategory;
    const matchQuery =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchQuery;
  });

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <PageContainer
      title="Trung tâm Trợ giúp & Hướng dẫn Vận hành"
      subtitle="Tài liệu quy trình nghiệp vụ điều phối logistics, quy chuẩn an toàn phương tiện và hướng dẫn giải quyết sự cố."
      action={
        <Badge variant="outline" className="text-xs py-1 px-3 gap-1.5 font-mono">
          <BookOpen className="h-3.5 w-3.5 text-primary" />
          Tài liệu chuẩn Enterprise v1.0
        </Badge>
      }
    >
      <div className="space-y-6 max-w-6xl">
        {/* 1. Hero Search Box */}
        <div className="relative rounded-2xl bg-linear-to-r from-primary/10 via-primary/5 to-transparent p-6 border border-primary/20 space-y-3">
          <div className="max-w-2xl space-y-1.5">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Bạn cần trợ giúp về nghiệp vụ gì?
            </h2>
            <p className="text-xs text-muted-foreground">
              Tìm kiếm hướng dẫn tối ưu tuyến đường, quản lý tài xế, kết nối GPS hoặc xuất báo cáo thống kê.
            </p>
          </div>

          <div className="relative max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Nhập từ khóa tìm kiếm (Ví dụ: tối ưu tuyến, đăng kiểm, GPS, xuất báo cáo...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 text-xs bg-card shadow-xs rounded-xl"
            />
          </div>
        </div>

        {/* 2. Quy trình Vận hành 4 Bước Chuẩn (Standard Workflow) */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Quy trình Điều phối Vận tải 4 Bước Chuẩn VietRoute
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {[
              {
                step: "01",
                icon: Package,
                title: "Tiếp nhận & Gom đơn",
                desc: "Thu thập đơn từ sàn TMĐT và khách hàng doanh nghiệp, phân loại theo khu vực bưu cục và kho trung chuyển.",
              },
              {
                step: "02",
                icon: Route,
                title: "Lập Lộ trình bằng AI",
                desc: "Thuật toán sắp xếp thứ tự trạm giao hàng, cân bằng tải trọng và tối ưu quãng đường ngắn nhất.",
              },
              {
                step: "03",
                icon: Truck,
                title: "Phân xe & Xuất bến",
                desc: "Kiểm tra hạn đăng kiểm hợp lệ, phân tài xế phụ trách và bàn giao bảng kê hàng hóa xuất kho.",
              },
              {
                step: "04",
                icon: Radio,
                title: "Giám sát GPS & Bàn giao",
                desc: "Theo dõi tọa độ di chuyển tức thời, tốc độ xe và xác nhận giao thành công với khách hàng.",
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-card border border-border rounded-xl p-4 shadow-2xs space-y-2 relative overflow-hidden group hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-black text-primary/20 group-hover:text-primary/30 transition-colors">
                      {item.step}
                    </span>
                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <h4 className="text-xs font-bold text-foreground">{item.title}</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Danh mục câu hỏi thường gặp (Interactive FAQ) */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Câu hỏi Nghiệp vụ Thường gặp (FAQ)
            </h3>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: "ALL", label: "Tất cả" },
                { id: "DISPATCH", label: "Điều phối & Đơn" },
                { id: "FLEET", label: "Đội xe & Tài xế" },
                { id: "GPS", label: "GPS & Bản đồ" },
                { id: "SYSTEM", label: "Hệ thống & API" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                      : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredFaqs.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground bg-card rounded-xl border border-border">
                Không tìm thấy câu hỏi phù hợp với từ khóa "{searchQuery}".
              </div>
            ) : (
              filteredFaqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="bg-card border border-border rounded-xl overflow-hidden shadow-2xs transition-all"
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full text-left p-4 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <span className="text-xs font-bold text-foreground flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        {faq.question}
                      </span>
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 text-primary shrink-0 transition-transform" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 transition-transform" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-border/50 bg-muted/10">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 4. Khung Liên hệ Hỗ trợ Kỹ thuật & Ca trực */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
          <div className="p-4 bg-card border border-border rounded-xl shadow-2xs flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block">Đường dây nóng Điều phối 24/7</span>
              <a href="tel:1900888999" className="text-sm font-bold text-foreground font-mono hover:text-primary">
                1900 888 999
              </a>
            </div>
          </div>

          <div className="p-4 bg-card border border-border rounded-xl shadow-2xs flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block">Email Kỹ thuật & Hỗ trợ API</span>
              <a href="mailto:support@vietroute.vn" className="text-sm font-bold text-foreground font-mono hover:text-emerald-600">
                support@vietroute.vn
              </a>
            </div>
          </div>

          <div className="p-4 bg-card border border-border rounded-xl shadow-2xs flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block">Thời gian xử lý cam kết (SLA)</span>
              <span className="text-sm font-bold text-foreground">
                Dưới 15 phút (Ca trực)
              </span>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
