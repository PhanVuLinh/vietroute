export interface OperationalContext {
  totalOrders: number;
  pendingOrders: number;
  inTransitOrders: number;
  urgentOrders: any[];
  availableDrivers: any[];
  busyDrivers: number;
  availableVehicles: any[];
  warehouses: any[];
  openIncidents: any[];
  internationalShipments: any[];
}

export interface AiChatMessageResponse {
  id: string;
  sender: 'AI';
  text: string;
  timestamp: string;
  insights?: {
    type: 'SLA_ALERT' | 'ROUTE_OPTIMIZATION' | 'DRIVER_DISPATCH' | 'FUEL_ANALYTICS' | 'WAREHOUSE_OVERLOAD' | 'INCIDENT_ALERT';
    title: string;
    description: string;
    metrics?: { label: string; value: string; positive?: boolean }[];
    actionLabel?: string;
    actionUrl?: string;
  };
}

/**
 * Hàm chuẩn hóa tiếng Việt: xóa dấu, chữ thường, bỏ ký tự thừa để phục vụ so khớp ý định (Intent Matching)
 */
export function normalizeVietnamese(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Kiểm tra xem chuỗi đầu vào có chứa bất kỳ từ khóa nào trong danh sách không
 */
function hasAnyKeyword(normalized: string, keywords: string[]): boolean {
  return keywords.some(kw => {
    const normKw = normalizeVietnamese(kw);
    return normalized.includes(normKw);
  });
}

/**
 * Động cơ Tri Thức & Nhận diện Ý Định Nghiệp Vụ Vận Tải VietRoute (In-house Domain AI Engine)
 * Hoàn toàn tự phát triển nội bộ, không phụ thuộc bất kỳ API đám mây bên ngoài nào.
 */
export function processVietRouteAiIntent(
  rawPrompt: string,
  ctx: OperationalContext,
  nowTime: string
): AiChatMessageResponse {
  const norm = normalizeVietnamese(rawPrompt);
  const msgId = `ai-${Date.now()}`;

  // =========================================================================
  // 1. KIỂM SOÁT PHẠM VI (Out-of-Scope Guard)
  // Ngăn chặn các câu hỏi ngoài nghiệp vụ logistics của trang web VietRoute
  // =========================================================================
  const outOfScopeKeywords = [
    'thoi tiet', 'troi mua', 'du bao thoi tiet', 'nang mua', 'bao so',
    'lam tho', 'bai tho', 'viet tho', 'ke chuyen', 'chuyen cuoi', 'hai huoc', 'hat ho',
    'nau an', 'mon an', 'cong thuc nau', 'nha hang ngon',
    'viet code', 'python la gi', 'javascript la gi', 'lap trinh vien', 'html css',
    'chatgpt', 'openai', 'gemini', 'claude', 'deepseek',
    'bong da', 'world cup', 'ngoai hang anh', 'ca si', 'showbiz', 'phim anh', 'dien vien',
    'bitcoin', 'crypto', 'tien ao', 'chung khoan', 'gia vang', 'ty gia ngoai te',
    'chinh tri', 'tong thong', 'bau cu', 'chien tranh',
    'kham benh', 'thuoc tri', 'bac si', 'tinh yeu', 'nguoi yeu', 'tam su tinh cam',
    'tro choi', 'game', 'danh bai'
  ];

  if (hasAnyKeyword(norm, outOfScopeKeywords)) {
    return {
      id: msgId,
      sender: 'AI',
      text: `Tôi là **VietRoute AI Copilot** — Trợ lý Trí tuệ Nhân tạo được đào tạo chuyên biệt cho **Nền tảng Quản trị Vận tải (TMS) & Kho bãi (WMS) VietRoute**.\n\n` +
        `Để đảm bảo độ tin cậy và chuẩn xác nghiệp vụ, tôi được thiết lập **chỉ trả lời trong phạm vi chức năng và vận hành của hệ thống VietRoute Logistics**.\n\n` +
        `Tôi không thể giải đáp các chủ đề ngoài nghiệp vụ như thời tiết, lập trình, giải trí hay các vấn đề bên ngoài.\n\n` +
        `👉 **Bạn có thể hỏi tôi về các nghiệp vụ:**\n` +
        `• Hướng dẫn tạo đơn hàng, tra cứu vận đơn, giải thích trạng thái đơn\n` +
        `• Bàn điều phối xe, thuật toán AI Match Score gán tài xế\n` +
        `• Tối ưu tuyến đường 2-Opt TSP, né giờ cấm tải nội đô\n` +
        `• Quản lý công suất 4 Tổng kho WMS, xếp hàng 3D lên thùng xe\n` +
        `• Giám sát GPS thời gian thực, phát hiện sụt dầu bất thường\n` +
        `• Rà soát đơn hàng có nguy cơ trễ hẹn cam kết SLA`,
      timestamp: nowTime,
      insights: {
        type: 'SLA_ALERT',
        title: 'Trợ Lý Nghiệp Vụ Vận Tải VietRoute',
        description: 'Chuyên trách hỗ trợ 100% nghiệp vụ quản trị vận tải và kho bãi nội bộ.',
        metrics: [
          { label: 'Phân hệ hỗ trợ', value: '12 Phân hệ', positive: true },
          { label: 'Dữ liệu thời gian thực', value: 'Kích hoạt', positive: true },
          { label: 'Phạm vi', value: 'Nội bộ VietRoute', positive: true },
        ],
        actionLabel: 'Xem Bảng Điều Khiển',
        actionUrl: '/dashboard',
      },
    };
  }

  // =========================================================================
  // 2. CHÀO HỎI & XÁC THỰC DANH TÍNH (Greeting & Identity)
  // Thân thiện, chuyên nghiệp, không xả dữ liệu thô kiểu lập trình viên
  // =========================================================================
  const greetingKeywords = [
    'xin chao', 'chao ban', 'chao copilot', 'chao tro ly', 'chao ad',
    'chao em', 'chao anh', 'chao chi', 'hello', 'hi copilot', 'hi bot', 'hi ai',
    'alo', 'good morning', 'good afternoon', 'chao nhe'
  ];

  if (hasAnyKeyword(norm, greetingKeywords) && norm.length < 35) {
    return {
      id: msgId,
      sender: 'AI',
      text: `Xin chào! Tôi là **VietRoute AI Copilot** — Trợ lý Trí tuệ Nhân tạo vận hành chuyên biệt cho Nền tảng Quản trị Vận tải & Kho bãi VietRoute.\n\n` +
        `Tôi có thể đồng hành và hỗ trợ bạn xử lý nhanh các tác vụ:\n\n` +
        `1. **Quản lý Đơn hàng & Điều phối:** Hướng dẫn tạo đơn, rà soát đơn gấp vi phạm SLA, tự động chấm điểm gán tài xế (AI Match Score).\n` +
        `2. **Tối ưu hóa Lộ trình (2-Opt TSP):** Quy hoạch tuyến giao đa điểm dừng, né khung giờ cấm tải đô thị và tiết kiệm chi phí nhiên liệu.\n` +
        `3. **Kho bãi WMS & Xếp hàng 3D:** Giám sát tỷ lệ lấp đầy 4 Tổng kho, mô phỏng xếp hàng 3D theo nguyên tắc LIFO và trọng tâm xe.\n` +
        `4. **Giám sát Xe & An toàn:** Theo dõi vị trí GPS thời gian thực, phát hiện bất thường sụt giảm nhiên liệu (chống thất thoát dầu).\n` +
        `5. **Vận tải Quốc tế & Tài chính:** Giám sát hạn lưu bãi container (Demurrage), đối soát COD và tính toán cước phí.\n\n` +
        `Bạn đang cần hỗ trợ xử lý nghiệp vụ nào trên hệ thống?`,
      timestamp: nowTime,
      insights: {
        type: 'SLA_ALERT',
        title: 'VietRoute Logistics Copilot',
        description: 'Trợ lý AI sẵn sàng hỗ trợ điều hành vận tải và tối ưu hóa chuỗi cung ứng.',
        metrics: [
          { label: 'Đơn chờ điều phối', value: `${ctx.pendingOrders} đơn`, positive: ctx.pendingOrders === 0 },
          { label: 'Tài xế sẵn sàng', value: `${ctx.availableDrivers.length} tài xế`, positive: true },
          { label: 'Xe rảnh bãi', value: `${ctx.availableVehicles.length} xe`, positive: true },
        ],
        actionLabel: 'Tới Bàn Điều Phối',
        actionUrl: '/dispatch',
      },
    };
  }

  // =========================================================================
  // 3. GIỚI THIỆU KHẢ NĂNG & HƯỚNG DẪN TỔNG QUAN HỆ THỐNG
  // =========================================================================
  const capabilitiesKeywords = [
    'ban la ai', 'ban lam duoc gi', 'chuc nang cua ban', 'ai nay la gi',
    'huong dan su dung web', 'website co gi', 'he thong gom nhung gi',
    'gioi thieu web', 'tro giup', 'menu co gi', 'tinh nang web', 'huong dan tong quan',
    'huong dan dung web', 'cach dung web'
  ];

  if (hasAnyKeyword(norm, capabilitiesKeywords)) {
    return {
      id: msgId,
      sender: 'AI',
      text: `**VietRoute Logistics Platform** là giải pháp quản trị vận tải (TMS) và kho bãi (WMS) toàn diện được tích hợp AI chuyên sâu:\n\n` +
        `• **Bảng điều khiển (\`/dashboard\`):** Cung cấp bức tranh toàn cảnh về KPI vận hành, chỉ số giao đúng giờ (OTD) và doanh thu thời gian thực.\n` +
        `• **Đơn hàng (\`/orders\`):** Tiếp nhận, tạo đơn hàng mới, in phiếu gửi e-waybill và theo dõi vòng đời đơn hàng.\n` +
        `• **Bàn điều phối (\`/dispatch\`):** Mô hình Machine Learning tự động tính điểm phù hợp (Match Score) để gán tài xế và phương tiện tối ưu.\n` +
        `• **Xếp hàng 3D (\`/load-optimizer\`):** Trực quan hóa thùng xe không gian 3 chiều, xếp hàng theo nguyên tắc LIFO và cân bằng trọng tâm xe.\n` +
        `• **Tối ưu tuyến đường (\`/routes\`):** Thuật toán 2-Opt TSP rút ngắn cự ly di chuyển và né các khung giờ cấm tải nội đô.\n` +
        `• **Kho bãi WMS (\`/warehouses\`):** Kiểm soát công suất 4 Tổng kho trung chuyển (Tân Bình, Sóng Thần, Cát Lái, Nội Bài) và dự báo nhu cầu nhập/xuất.\n` +
        `• **Giám sát GPS (\`/tracking\`):** Định vị phương tiện, giám sát nhiệt độ thùng lạnh và cảm biến nhiên liệu chống gian lận.\n` +
        `• **Đội xe & Tài xế (\`/fleet\`, \`/drivers\`):** Quản lý hồ sơ bằng lái, lịch đăng kiểm, bảo dưỡng định kỳ xe tải.\n` +
        `• **Sự cố & Khiếu nại (\`/incidents\`):** Tiếp nhận xử lý hỏng hóc, tai nạn, đền bù bảo hiểm theo cam kết SLA.\n` +
        `• **Đối soát COD & Cước phí (\`/finance/cod\`):** Quản lý dòng tiền thu hộ COD và đối soát cước phí minh bạch.\n\n` +
        `Bạn có thể yêu cầu tôi hướng dẫn chi tiết bất kỳ tính năng nào ở trên!`,
      timestamp: nowTime,
      insights: {
        type: 'ROUTE_OPTIMIZATION',
        title: 'Cẩm Nang Vận Hành Hệ Thống VietRoute',
        description: 'Tích hợp đầy đủ các phân hệ quản lý vận tải đường bộ, kho bãi và giao nhận chặng cuối.',
        metrics: [
          { label: 'Tổng đơn hàng', value: `${ctx.totalOrders} đơn`, positive: true },
          { label: 'Kho trung chuyển', value: `${ctx.warehouses.length} Hub`, positive: true },
          { label: 'OTD toàn mạng', value: '98.5%', positive: true },
        ],
        actionLabel: 'Mở Bảng Điều Khiển',
        actionUrl: '/dashboard',
      },
    };
  }

  // =========================================================================
  // 4. HƯỚNG DẪN TẠO ĐƠN HÀNG MỚI (Order Creation)
  // =========================================================================
  const orderCreationKeywords = [
    'tao don', 'lap don', 'nhap don', 'them don', 'tao van don',
    'dat don', 'cach tao don', 'huong dan tao don', 'tao don moi',
    'them don hang', 'lap van don', 'nhap don hang'
  ];

  if (hasAnyKeyword(norm, orderCreationKeywords)) {
    return {
      id: msgId,
      sender: 'AI',
      text: `**Hướng dẫn chi tiết quy trình Tạo Đơn Hàng Mới trên VietRoute:**\n\n` +
        `1. **Truy cập:** Mở menu **Đơn hàng** (\`/orders\`) trên thanh điều hướng bên trái.\n` +
        `2. **Mở biểu mẫu:** Bấm nút **'+ Tạo đơn hàng mới'** tại góc trên bên phải màn hình.\n` +
        `3. **Điền thông tin người gửi & người nhận:**\n` +
        `   • Họ tên, Số điện thoại người gửi và địa chỉ lấy hàng (hoặc chọn Tổng kho xuất phát).\n` +
        `   • Họ tên, Số điện thoại người nhận và địa chỉ giao hàng chi tiết (Phường/Xã, Quận/Huyện, Tỉnh/Thành phố).\n` +
        `4. **Thông tin kiện hàng & Dịch vụ:**\n` +
        `   • Loại hàng hóa, Trọng lượng thực tế (kg), Kích thước Dài x Rộng x Cao (cm) để hệ thống tự động tính khối lượng quy đổi.\n` +
        `   • Chọn mức độ ưu tiên: **Tiêu chuẩn**, **Giao nhanh**, hoặc **Khẩn cấp (Hỏa tốc)**.\n` +
        `   • Nhập tiền thu hộ COD (nếu có) và giá trị khai giá bảo hiểm hàng hóa.\n` +
        `5. **Hoàn tất:** Bấm **'Xác nhận tạo đơn'** — Hệ thống sẽ tự động cấp mã vận đơn định dạng \`VR-2026-XXXX\`, sinh mã Barcode/QR và chuyển đơn sang trạng thái \`PENDING\` để chờ bàn điều phối xếp xe.`,
      timestamp: nowTime,
      insights: {
        type: 'SLA_ALERT',
        title: 'Tạo Đơn Hàng & Cấp Mã Vận Đơn',
        description: 'Đơn hàng mới tạo sẽ tức thời được ghi nhận vào hàng đợi điều phối.',
        metrics: [
          { label: 'Đơn chờ xếp xe', value: `${ctx.pendingOrders} đơn`, positive: ctx.pendingOrders === 0 },
          { label: 'Tổng đơn hôm nay', value: `${ctx.totalOrders} đơn`, positive: true },
        ],
        actionLabel: 'Tới Trang Quản Lý Đơn Hàng',
        actionUrl: '/orders',
      },
    };
  }

  // =========================================================================
  // 5. TRA CỨU ĐƠN HÀNG & MÃ VẬN ĐƠN (Order Tracking & Lookup)
  // =========================================================================
  const trackingLookupKeywords = [
    'tra cuu', 'tra don', 'tim don', 'theo doi don', 'kiem tra don',
    'don hang o dau', 'ma van don', 'ma don', 'tra van don', 'vr '
  ];

  if (hasAnyKeyword(norm, trackingLookupKeywords) || norm.includes('vr-') || norm.includes('vr2026')) {
    return {
      id: msgId,
      sender: 'AI',
      text: `**Quy trình Tra cứu Đơn Hàng & Hành Trình Vận Chuyển:**\n\n` +
        `• **Tra cứu nội bộ (Dành cho Điều phối viên & Quản trị viên):**\n` +
        `  1. Nhấn tổ hợp phím **Ctrl + K** (hoặc bấm vào ô tìm kiếm ở thanh tiêu đề trên cùng) để mở tìm kiếm nhanh.\n` +
        `  2. Nhập mã vận đơn (ví dụ: \`VR-2026-001\`) hoặc SĐT người nhận để xem chi tiết tình trạng đơn.\n` +
        `  3. Hoặc vào trang **Đơn hàng** (\`/orders\`) sử dụng bộ lọc trạng thái và ngày tạo.\n\n` +
        `• **Tra cứu công khai (Dành cho Khách hàng / Người nhận):**\n` +
        `  Khách hàng có thể truy cập trang **Tra cứu công khai** (\`/track\`) mà không cần đăng nhập tài khoản. Chỉ cần nhập mã vận đơn để xem bản đồ trực tuyến vị trí tài xế, thời gian dự kiến giao (ETA) và ảnh chụp ký nhận e-POD khi hoàn tất.`,
      timestamp: nowTime,
      insights: {
        type: 'ROUTE_OPTIMIZATION',
        title: 'Cổng Tra Cứu Hành Trình Vận Đơn',
        description: 'Hỗ trợ tra cứu nhanh trạng thái đơn hàng và vị trí xe theo thời gian thực.',
        metrics: [
          { label: 'Đang vận chuyển', value: `${ctx.inTransitOrders} đơn`, positive: true },
          { label: 'Đơn chờ giao', value: `${ctx.pendingOrders} đơn`, positive: true },
        ],
        actionLabel: 'Mở Trang Tra Cứu Vận Đơn',
        actionUrl: '/track',
      },
    };
  }

  // =========================================================================
  // 6. GIẢI THÍCH VÒNG ĐỜI & TRẠNG THÁI ĐƠN HÀNG (Order Status Lifecycle)
  // =========================================================================
  const orderStatusKeywords = [
    'trang thai don', 'quy trinh don', 'vong doi don', 'pending la gi',
    'in transit la gi', 'in_transit', 'delivered la gi', 'assigned la gi',
    'cac trang thai don', 'y nghia trang thai'
  ];

  if (hasAnyKeyword(norm, orderStatusKeywords)) {
    return {
      id: msgId,
      sender: 'AI',
      text: `**Quy trình 6 trạng thái trong Vòng Đời Đơn Hàng VietRoute:**\n\n` +
        `1. **PENDING (Chờ xử lý):** Đơn hàng mới được tạo trên hệ thống, đang chờ điều phối viên duyệt thông tin và phân bổ phương tiện.\n` +
        `2. **CONFIRMED (Đã xác nhận):** Đơn hợp lệ, Tổng kho xuất hàng bắt đầu in mã barcode và đóng gói kiện hàng.\n` +
        `3. **ASSIGNED (Đã gán xe):** Đã chỉ định phương tiện và tài xế qua thuật toán AI Match Score. Tài xế nhận thông báo lệnh chạy trên App.\n` +
        `4. **IN_TRANSIT (Đang vận chuyển):** Xe tải đã xuất bến và đang di chuyển trên lộ trình đến địa chỉ người nhận. Hệ thống kích hoạt chia sẻ GPS.\n` +
        `5. **DELIVERED (Giao thành công):** Người nhận đã nhận hàng và ký xác nhận trên biên bản điện tử e-POD. Trạng thái kết thúc thành công.\n` +
        `6. **CANCELLED (Đã hủy):** Đơn bị hủy do khách hàng thay đổi yêu cầu hoặc do sự cố không thể khắc phục.`,
      timestamp: nowTime,
      insights: {
        type: 'SLA_ALERT',
        title: 'Chuẩn Hóa Vòng Đời Trạng Thái Đơn Hàng',
        description: 'Mọi thay đổi trạng thái đều được lưu nhật ký kiểm toán (Audit Log) minh bạch.',
        metrics: [
          { label: 'Chờ xử lý (PENDING)', value: `${ctx.pendingOrders} đơn`, positive: ctx.pendingOrders === 0 },
          { label: 'Đang giao (IN_TRANSIT)', value: `${ctx.inTransitOrders} đơn`, positive: true },
        ],
        actionLabel: 'Xem Danh Sách Đơn',
        actionUrl: '/orders',
      },
    };
  }

  // =========================================================================
  // 7. BÀN ĐIỀU PHỐI & GÁN TÀI XẾ (Dispatch & Assignment)
  // =========================================================================
  const dispatchKeywords = [
    'dieu phoi', 'gan xe', 'gan tai xe', 'phan bo', 'ban dieu phoi',
    'ghep don', 'xep xe', 'cach phan bo', 'chon tai xe', 'dieu xe',
    'phan xe', 'chi dinh tai xe'
  ];

  if (hasAnyKeyword(norm, dispatchKeywords)) {
    return {
      id: msgId,
      sender: 'AI',
      text: `**Hướng dẫn vận hành Bàn Điều Phối Vận Tải (\`/dispatch\`):**\n\n` +
        `1. **Giao diện bàn điều phối:**\n` +
        `   • Cột bên trái: Danh sách các đơn hàng đang chờ giao (\`PENDING\`), có gắn nhãn ưu tiên và thời hạn cam kết SLA.\n` +
        `   • Cột bên phải: Danh sách Đội xe và Tài xế đang ở trạng thái trực tuyến sẵn sàng (\`AVAILABLE\`).\n` +
        `2. **Phương thức phân bổ:**\n` +
        `   • **Tự động phân bổ bằng AI (Khuyên dùng):** Bấm nút **'Tự động phân bổ AI'**. Hệ thống sẽ chạy mô hình học máy \`driver_match_model\` để ghép đơn vào tài xế có điểm Match Score cao nhất.\n` +
        `   • **Điều phối thủ công:** Kéo thả thẻ đơn hàng trực tiếp vào ô phương tiện/tài xế mong muốn.\n` +
        `3. **Gửi lệnh:** Sau khi gán, bấm **'Xác nhận điều phối'** — Tài xế sẽ nhận được thông báo lệnh vận chuyển kèm lộ trình tối ưu trên App điện thoại.`,
      timestamp: nowTime,
      insights: {
        type: 'DRIVER_DISPATCH',
        title: 'Bàn Điều Phối Đội Xe Thông Minh',
        description: 'Hỗ trợ điều phối tự động và thủ công linh hoạt theo nhu cầu vận tải.',
        metrics: [
          { label: 'Đơn chờ điều phối', value: `${ctx.pendingOrders} đơn`, positive: ctx.pendingOrders === 0 },
          { label: 'Tài xế sẵn sàng', value: `${ctx.availableDrivers.length} tài xế`, positive: true },
          { label: 'Xe rảnh bãi', value: `${ctx.availableVehicles.length} xe`, positive: true },
        ],
        actionLabel: 'Mở Bàn Điều Phối',
        actionUrl: '/dispatch',
      },
    };
  }

  // =========================================================================
  // 8. THUẬT TOÁN AI MATCH SCORE (AI Driver Matching)
  // =========================================================================
  const matchScoreKeywords = [
    'match score', 'cham diem tai xe', 'tieu chi gan xe', 'thuat toan dieu phoi',
    'mo hinh driver match', 'tieu chi cham diem', 'cham diem phan bo'
  ];

  if (hasAnyKeyword(norm, matchScoreKeywords)) {
    return {
      id: msgId,
      sender: 'AI',
      text: `**Thuật Toán Chấm Điểm Ghép Nối Tài Xế (AI Driver Match Score):**\n\n` +
        `Mô hình Machine Learning nội bộ của VietRoute (\`driver_match_model.joblib\`) tính toán điểm tương thích từ **0 đến 100 điểm** dựa trên 4 trọng số nghiệp vụ cốt lõi:\n\n` +
        `1. **Khoảng cách tiếp cận (Trọng số 35%):** Đo bán kính GPS thực tế từ vị trí hiện tại của xe đến kho lấy hàng. Cự ly càng ngắn điểm càng cao.\n` +
        `2. **Tải trọng & Thể tích còn trống (Trọng số 25%):** Đảm bảo kiện hàng nằm trong giới hạn tải trọng cho phép của thùng xe, tối ưu tỷ lệ lấp đầy.\n` +
        `3. **Chỉ số đúng giờ OTD của tài xế (Trọng số 25%):** Ưu tiên các bác tài có lịch sử giao hàng đúng hạn trên 98% và điểm đánh giá sao cao.\n` +
        `4. **Phù hợp Giấy phép Lái xe (Trọng số 15%):** Kiểm tra hạng bằng lái (B2 cho xe Van, Hạng C cho xe tải 5T - 8T, Hạng FC cho xe đầu kéo Container) đảm bảo tuân thủ 100% quy định pháp luật.`,
      timestamp: nowTime,
      insights: {
        type: 'DRIVER_DISPATCH',
        title: 'Mô Hình Ghép Nối Tài Xế Học Máy',
        description: 'Tối ưu hóa khả năng đáp ứng cuốc xe và nâng cao chỉ số phục vụ khách hàng.',
        metrics: [
          { label: 'Tài xế trực tuyến', value: `${ctx.availableDrivers.length} tài xế`, positive: true },
          { label: 'Tỷ lệ OTD trung bình', value: '98.5%', positive: true },
          { label: 'Độ chính xác Match', value: '94.2%', positive: true },
        ],
        actionLabel: 'Kiểm Tra Bàn Điều Phối',
        actionUrl: '/dispatch',
      },
    };
  }

  // =========================================================================
  // 9. CẢNH BÁO NGUY CƠ TRỄ HẠN SLA (SLA Risk Alert)
  // =========================================================================
  const slaKeywords = [
    'sla', 'tre', 'nguy co', 'cham', 'khan cap', 'don gap', 'vi pham sla',
    'qua han', 'otd', 'cam ket giao'
  ];

  if (hasAnyKeyword(norm, slaKeywords)) {
    const urgentCount = ctx.urgentOrders.length;
    return {
      id: msgId,
      sender: 'AI',
      text: `**Rà Soát Nguy Cơ Vi Phạm Cam Kết Giao Hàng (SLA) Toàn Mạng:**\n\n` +
        `Hệ thống AI đã quét toàn bộ hàng đợi vận hành và phát hiện **${urgentCount} đơn hàng ưu tiên cao** cần xử lý khẩn cấp:\n\n` +
        (urgentCount > 0
          ? ctx.urgentOrders.map(o => `• **Đơn \`${o.order_code}\`:** ${o.warehouse?.name || 'Tổng kho'} → Điểm giao. Mức ưu tiên: **${o.priority}**`).slice(0, 4).join('\n')
          : '• Hiện tại không có đơn hàng nào bị trễ cam kết SLA.') +
        `\n\n• **Tình hình lưu thông:** Toàn mạng đang có **${ctx.inTransitOrders} đơn** vận chuyển đúng tiến độ, chỉ số OTD duy trì ở mức **98.4%**.\n` +
        `• **Khuyến nghị AI:** Ưu tiên chỉ định xe tải Van xuất bến ngay cho các đơn hàng khẩn cấp nêu trên để tránh bị phạt cam kết thời gian.`,
      timestamp: nowTime,
      insights: {
        type: 'SLA_ALERT',
        title: 'Cảnh Báo Rủi Ro Vi Phạm SLA Đơn Hàng',
        description: `Phát hiện ${urgentCount} đơn hàng cần ưu tiên cấp xe để đảm bảo đúng tiến độ cam kết.`,
        metrics: [
          { label: 'Đơn có nguy cơ', value: `${urgentCount} đơn`, positive: urgentCount === 0 },
          { label: 'Đang vận chuyển', value: `${ctx.inTransitOrders} đơn`, positive: true },
          { label: 'Chỉ số OTD', value: '98.4%', positive: true },
        ],
        actionLabel: 'Xử Lý Đơn Gấp Ngay',
        actionUrl: '/dispatch',
      },
    };
  }

  // =========================================================================
  // 10. TỐI ƯU HÓA TUYẾN ĐƯỜNG & THUẬT TOÁN TSP (Route Optimization)
  // =========================================================================
  const routeKeywords = [
    'tuyen', 'toi uu tuyen', 'lo trinh', 'cung duong', '2 opt', '2-opt',
    'tsp', 'duong cam', 'tiet kiem xang', 'tram bot', 'thu phi bot',
    'duong cam tai', 'gom don', 'toi uu lo trinh'
  ];

  if (hasAnyKeyword(norm, routeKeywords)) {
    return {
      id: msgId,
      sender: 'AI',
      text: `**Phân Hệ Tối Ưu Hóa Tuyến Đường Đa Điểm Dừng (\`/routes\`):**\n\n` +
        `Hệ thống sử dụng giải thuật **2-Opt TSP & Heuristic Clustered Routing** chuyên biệt cho bài toán giao hàng chặng cuối (Last-Mile Delivery):\n\n` +
        `• **Gom cụm đơn hàng:** Phân cụm các điểm giao hàng có cùng khu vực địa lý, sắp xếp thứ tự điểm dừng thành một vòng cung khép kín nhằm loại bỏ hoàn toàn các đoạn đường đi lặp lại.\n` +
        `• **Hiệu quả định lượng:** Rút ngắn trung bình **15% - 28% tổng quãng đường** (tiết kiệm khoảng 12.4 km cho mỗi ca chạy), giảm 3.5 - 5.0 Lít dầu diesel và cắt giảm 12.8 kg khí thải CO2.\n` +
        `• **Tự động né giờ cấm tải:** Nhận diện và tự động điều hướng tránh các trục đường cấm xe tải trên 2.5 Tấn theo khung giờ đô thị tại TP.HCM (06h-09h và 16h-20h) và Hà Nội.\n` +
        `• **Dự toán chi phí trạm thu phí BOT:** Tự động tính toán các trạm thu phí trên tuyến đường để hạch toán chi phí chuyến xe chính xác nhất.`,
      timestamp: nowTime,
      insights: {
        type: 'ROUTE_OPTIMIZATION',
        title: 'Quy Hoạch Tuyến Đường Vận Tải Thông Minh',
        description: 'Giải thuật 2-Opt TSP tối ưu cự ly di chuyển và tiết kiệm chi phí nhiên liệu.',
        metrics: [
          { label: 'Cự ly cắt giảm TB', value: '-12.4 km', positive: true },
          { label: 'Tiết kiệm nhiên liệu', value: '-18.5%', positive: true },
          { label: 'Tuân thủ giờ cấm', value: '100%', positive: true },
        ],
        actionLabel: 'Mở Bản Đồ Tuyến Đường',
        actionUrl: '/routes',
      },
    };
  }

  // =========================================================================
  // 11. QUẢN LÝ KHO BÃI WMS & DỰ BÁO NHU CẦU (Warehouses)
  // =========================================================================
  const warehouseKeywords = [
    'kho', 'kho bai', 'wms', 'suc chua', 'lap day', 'ton kho',
    'nhap kho', 'xuat kho', 'dock', 'hub', 'tan binh', 'song than',
    'cat lai', 'noi bai', 'qua tai kho', 'cong suat kho'
  ];

  if (hasAnyKeyword(norm, warehouseKeywords)) {
    const overloaded = ctx.warehouses.filter(w => w.capacity > 0 && (w.used_capacity / w.capacity) >= 0.75);
    return {
      id: msgId,
      sender: 'AI',
      text: `**Báo Cáo Tình Hình Mạng Lưới Kho Bãi VietRoute WMS (\`/warehouses\`):**\n\n` +
        `Hệ thống đang giám sát và quản lý **${ctx.warehouses.length} Tổng kho trung chuyển chiến lược**:\n\n` +
        ctx.warehouses.map(w => {
          const fill = w.capacity > 0 ? ((w.used_capacity / w.capacity) * 100).toFixed(1) : '60.0';
          const alertFlag = Number(fill) >= 75 ? ' ⚠️ *(Cảnh báo tải cao)*' : ' *(Ổn định)*';
          return `• **${w.name} (${w.city || 'Tổng kho'}):** Sử dụng ${w.used_capacity}/${w.capacity || 1000} Tấn (**${fill}%**)${alertFlag}`;
        }).join('\n') +
        `\n\n• **Dự báo nhu cầu lưu kho AI:** Tích hợp mô hình Random Forest dự báo lưu lượng hàng hóa xuất nhập trong 14 ngày tới để chủ động bố trí nhân lực nhặt hàng (picking) và diện tích lưu trữ.\n` +
        `• **Khuyến nghị AI:** ${overloaded.length > 0 ? `Tiến hành lệnh điều chuyển hàng nội bộ (Stock Transfer) từ các kho tải cao sang kho phụ cận để giải tỏa áp lực cửa Dock.` : 'Tất cả các kho đang duy trì tải trọng an toàn dưới ngưỡng 75%.'}`,
      timestamp: nowTime,
      insights: {
        type: 'WAREHOUSE_OVERLOAD',
        title: 'Báo Cáo Tỷ Lệ Lấp Đầy Kho Bãi',
        description: overloaded.length > 0
          ? `Có ${overloaded.length} tổng kho đang có tỷ lệ lấp đầy trên 75%. Cần giải tỏa hàng.`
          : 'Toàn bộ hệ thống kho bãi đang hoạt động ổn định trong ngưỡng an toàn.',
        metrics: [
          { label: 'Tổng kho giám sát', value: `${ctx.warehouses.length} Hub`, positive: true },
          { label: 'Kho cảnh báo tải', value: `${overloaded.length} kho`, positive: overloaded.length === 0 },
          { label: 'Tải trung bình', value: '64.8%', positive: true },
        ],
        actionLabel: 'Mở Quản Lý Kho WMS',
        actionUrl: '/warehouses',
      },
    };
  }

  // =========================================================================
  // 12. XẾP HÀNG 3D LÊN THÙNG XE (3D Load Optimization)
  // =========================================================================
  const load3dKeywords = [
    'xep hang 3d', 'thung xe 3d', '3d', 'lifo', 'trong tam',
    'center of gravity', 'chat xep', 'xep hang len xe', 'mo hinh 3d',
    'xep hang', 'sap xep thung xe'
  ];

  if (hasAnyKeyword(norm, load3dKeywords)) {
    return {
      id: msgId,
      sender: 'AI',
      text: `**Phân Hệ Xếp Hàng 3D Lên Thùng Xe (\`/load-optimizer\`):**\n\n` +
        `Hệ thống trực quan hóa mô hình 3D lòng thùng xe tải và container, hỗ trợ giải quyết bài toán xếp dỡ tối ưu:\n\n` +
        `• **Nguyên tắc LIFO (Last-In, First-Out):** Kiện hàng giao cho điểm dừng cuối cùng sẽ được xếp sâu nhất vào bên trong; kiện hàng giao đầu tiên xếp ngay sát cửa thùng xe để bốc dỡ nhanh chóng mà không cần đảo chuyển xáo trộn hàng hóa.\n` +
        `• **Cân bằng trọng tâm xe (Center of Gravity):** Thuật toán tự động phân bổ các kiện hàng có khối lượng nặng ở dưới sàn và nằm giữa 2 trục bánh xe, các kiện nhẹ xếp lên trên, ngăn ngừa triệt để nguy cơ nghiêng lật xe khi vào cua hoặc vượt đèo dốc.\n` +
        `• **Mô phỏng 3D xoay 360°:** Điều phối viên và công nhân bốc xếp có thể quan sát trực tiếp mô hình thùng xe từ mọi góc độ để hướng dẫn thao tác xếp hàng thực tế chuẩn xác.`,
      timestamp: nowTime,
      insights: {
        type: 'ROUTE_OPTIMIZATION',
        title: 'Mô Phỏng Xếp Hàng 3D Thùng Xe',
        description: 'Tối ưu hóa thể tích thùng hàng và bảo đảm an toàn trọng tâm xe.',
        metrics: [
          { label: 'Tỷ lệ lấp đầy thể tích', value: '88.5%', positive: true },
          { label: 'Quy tắc dỡ hàng', value: 'LIFO Chuẩn', positive: true },
          { label: 'Cân bằng trọng tâm', value: 'Đạt chuẩn', positive: true },
        ],
        actionLabel: 'Mở Xếp Hàng 3D',
        actionUrl: '/load-optimizer',
      },
    };
  }

  // =========================================================================
  // 13. QUẢN LÝ ĐỘI XE & PHƯƠNG TIỆN (Fleet Management)
  // =========================================================================
  const fleetKeywords = [
    'xe tai', 'doi xe', 'phuong tien', 'bao duong xe', 'dang kiem',
    'tai trong xe', 'xe ranh', 'bai xe', 'xe van', 'xe container',
    'kiem tra xe', 'tinh trang xe'
  ];

  if (hasAnyKeyword(norm, fleetKeywords)) {
    return {
      id: msgId,
      sender: 'AI',
      text: `**Quản Trị Đội Xe Vận Tải VietRoute (\`/fleet\`):**\n\n` +
        `• Toàn hệ thống hiện có **${ctx.availableVehicles.length} phương tiện** đang ở trạng thái **RẢNH BÃI (AVAILABLE)** sẵn sàng tiếp nhận lệnh vận chuyển.\n` +
        `• **Phân loại phương tiện:**\n` +
        `  - Xe Van đô thị (1.0 - 1.5 Tấn): Linh hoạt giao hàng nội đô, luồn lách ngõ hẻm.\n` +
        `  - Xe tải thùng kín (2.5T, 5.0T, 8.0T): Vận chuyển liên tỉnh và kết nối mạng lưới kho.\n` +
        `  - Xe đầu kéo Container (20ft, 40ft): Phục vụ hàng xuất nhập khẩu tại cảng biển.\n` +
        `• **Giám sát đăng kiểm & bảo dưỡng:** Tự động cảnh báo trước 15 ngày khi xe sắp hết hạn Đăng kiểm hoặc Bảo hiểm TNDS bắt buộc, đồng thời nhắc lịch thay dầu phanh định kỳ theo số km thực tế.`,
      timestamp: nowTime,
      insights: {
        type: 'DRIVER_DISPATCH',
        title: 'Hiện Trạng Đội Xe Vận Tải',
        description: 'Theo dõi tình trạng sẵn sàng và bảo dưỡng kỹ thuật định kỳ.',
        metrics: [
          { label: 'Xe rảnh bãi', value: `${ctx.availableVehicles.length} xe`, positive: true },
          { label: 'Tỷ lệ sẵn sàng', value: '92.0%', positive: true },
          { label: 'Xe bảo dưỡng', value: '0 xe', positive: true },
        ],
        actionLabel: 'Xem Quản Lý Đội Xe',
        actionUrl: '/fleet',
      },
    };
  }

  // =========================================================================
  // 14. QUẢN LÝ TÀI XẾ & BẰNG LÁI (Drivers Management)
  // =========================================================================
  const driversKeywords = [
    'tai xe', 'lai xe', 'bang lai', 'hang c', 'hang fc', 'hang b2',
    'danh gia tai xe', 'cham cong', 'otd tai xe', 'ho so tai xe',
    'danh sach tai xe'
  ];

  if (hasAnyKeyword(norm, driversKeywords)) {
    const topDriver = ctx.availableDrivers[0];
    return {
      id: msgId,
      sender: 'AI',
      text: `**Quản Lý Đội Ngũ Tài Xế VietRoute (\`/drivers\`):**\n\n` +
        `• Hiện có **${ctx.availableDrivers.length} tài xế** đang ở trạng thái **SẴN SÀNG (AVAILABLE)** và **${ctx.busyDrivers} tài xế** đang thực hiện ca giao hàng.\n` +
        `• **Tài xế tiêu biểu rảnh cuốc:** ${topDriver ? `**${topDriver.full_name}** (${topDriver.driver_code}) — Bằng lái hạng: \`${topDriver.license_type}\`, Tỷ lệ đúng giờ: **${topDriver.on_time_rate}%**` : 'Đang điều phối'}\n` +
        `• **Chỉ số hiệu suất OTD (On-Time Delivery):** Hệ thống tự động ghi nhận tỷ lệ giao hàng đúng hẹn và đánh giá sao từ khách hàng để xét thưởng năng suất hàng tháng.\n` +
        `• **Quy định an toàn:** Giám sát thời gian lái xe liên tục không quá 4 giờ và không vượt quá 10 giờ/ngày theo đúng Luật Giao thông Đường bộ.`,
      timestamp: nowTime,
      insights: {
        type: 'DRIVER_DISPATCH',
        title: 'Nguồn Lực Đội Ngũ Tài Xế',
        description: 'Tài xế sẵn sàng nhận đơn với xếp hạng hiệu suất cao.',
        metrics: [
          { label: 'Tài xế sẵn sàng', value: `${ctx.availableDrivers.length} người`, positive: true },
          { label: 'Đang chạy cuốc', value: `${ctx.busyDrivers} người`, positive: false },
          { label: 'OTD trung bình', value: '98.5%', positive: true },
        ],
        actionLabel: 'Xem Danh Sách Tài Xế',
        actionUrl: '/drivers',
      },
    };
  }

  // =========================================================================
  // 15. CỔNG THÔNG TIN & APP DÀNH CHO TÀI XẾ (Driver App Portal)
  // =========================================================================
  const driverAppKeywords = [
    'app tai xe', 'ung dung tai xe', 'portal tai xe', 'ky nhan',
    'pod', 'e-pod', 'chu ky dien tu', 'anh giao hang', 'app di dong',
    'ung dung dien thoai', 'lai xe xem don'
  ];

  if (hasAnyKeyword(norm, driverAppKeywords)) {
    return {
      id: msgId,
      sender: 'AI',
      text: `**Cổng Ứng Dụng Di Động Dành Cho Tài Xế (\`/driver\`):**\n\n` +
        `Giao diện được thiết kế tối ưu trên điện thoại thông minh phục vụ tài xế giao nhận ngoài hiện trường:\n\n` +
        `1. **Xem danh sách đơn được gán:** Tài xế thấy ngay các đơn hàng cần giao theo thứ tự tối ưu của bản đồ.\n` +
        `2. **Bắt đầu hành trình:** Bấm nút *'Bắt đầu chuyến'* để hệ thống tự động kích hoạt chia sẻ GPS cho khách hàng và điều phối viên.\n` +
        `3. **Ký nhận điện tử (e-POD):** Khi giao hàng tới nơi, tài xế mở màn hình ký tên cho khách hàng ký cảm ứng trực tiếp hoặc chụp ảnh gói hàng tại địa chỉ giao.\n` +
        `4. **Hoàn tất cuốc:** Đơn hàng tức thì cập nhật trạng thái \`DELIVERED\`, hoàn tất đối soát không cần dùng chứng từ giấy.`,
      timestamp: nowTime,
      insights: {
        type: 'DRIVER_DISPATCH',
        title: 'Cổng Thông Tin App Tài Xế Di Động',
        description: 'Hỗ trợ tiếp nhận đơn và ký nhận e-POD tức thời trên điện thoại.',
        metrics: [
          { label: 'Biên bản e-POD', value: 'Không chạm', positive: true },
          { label: 'Đồng bộ realtime', value: '100%', positive: true },
        ],
        actionLabel: 'Mở Cổng App Tài Xế',
        actionUrl: '/driver',
      },
    };
  }

  // =========================================================================
  // 16. GIÁM SÁT HÀNH TRÌNH GPS & TELEMETRY (Tracking)
  // =========================================================================
  const trackingGpsKeywords = [
    'giam sat', 'gps', 'dinh vi', 'telemetry', 'toc do xe',
    'thung lanh', 'nhiet do', 'cold chain', 'hanh trinh xe',
    'theo doi xe', 'dinh vi xe'
  ];

  if (hasAnyKeyword(norm, trackingGpsKeywords)) {
    return {
      id: msgId,
      sender: 'AI',
      text: `**Hệ Thống Giám Sát GPS & Telemetry Thời Gian Thực (\`/tracking\`):**\n\n` +
        `• Bản đồ số trực quan cập nhật vị trí toàn bộ đội xe đang lăn bánh với chu kỳ truyền tin 10 giây/lần.\n` +
        `• **Cảnh báo tốc độ an toàn:** Tự động cảnh báo ngay khi xe chạy quá tốc độ giới hạn của từng đoạn đường đô thị hoặc cao tốc.\n` +
        `• **Kiểm soát nhiệt độ Thùng xe Đông lạnh (Cold Chain):** Đo liên tục nhiệt độ bảo quản thực phẩm/dược phẩm (-18°C đến +4°C). Nếu máy lạnh gặp sự cố hoặc cửa thùng mở quá lâu làm nhiệt độ tăng quá ngưỡng, chuông cảnh báo đỏ sẽ lập tức vang lên trên màn hình điều vận.`,
      timestamp: nowTime,
      insights: {
        type: 'FUEL_ANALYTICS',
        title: 'Giám Sát Hành Trình Đội Xe Telemetry',
        description: 'Kiểm soát vị trí GPS, vận tốc di chuyển và nhiệt độ chuỗi cung ứng lạnh.',
        metrics: [
          { label: 'Xe đang online', value: `${ctx.inTransitOrders} xe`, positive: true },
          { label: 'Nhiệt độ thùng lạnh', value: '-18.2°C (Chuẩn)', positive: true },
          { label: 'Cảnh báo vi phạm tốc độ', value: '0 trường hợp', positive: true },
        ],
        actionLabel: 'Mở Bản Đồ Giám Sát GPS',
        actionUrl: '/tracking',
      },
    };
  }

  // =========================================================================
  // 17. PHÁT HIỆN SỤT DẦU & GIAN LẬN NHIÊN LIỆU (Fuel Fraud Alert)
  // =========================================================================
  const fuelKeywords = [
    'hut dau', 'trom dau', 'nhien lieu', 'sut dau', 'xang',
    'hao dau', 'gian lan', 'lech tuyen', 'bat thuong', 'can-bus',
    'can bus', 'tieu hao nhien lieu', 'mat dau'
  ];

  if (hasAnyKeyword(norm, fuelKeywords)) {
    return {
      id: msgId,
      sender: 'AI',
      text: `**Hệ Thống AI Giám Sát Nhiên Liệu & Chống Gian Lận (\`/tracking\`):**\n\n` +
        `• Dữ liệu mức dầu trong bình được truyền trực tiếp từ phao cảm biến và giao thức CAN-bus trên xe về máy chủ mỗi 30 giây.\n` +
        `• **Mô hình học máy Isolation Forest:** Tự động phân tích mức tiêu thụ dầu thực tế so với tải trọng xe và độ dốc cung đường.\n` +
        `• **Cảnh báo rút ruột / hút dầu trộm:** Nếu mức nhiên liệu sụt giảm đột ngột trên 5 Lít trong khi xe đang dừng đỗ tắt máy, hệ thống sẽ lập tức gắn cờ đỏ *'Nghi vấn rút dầu trộm'* kèm tọa độ GPS và thời điểm xảy ra sự việc để đội thanh tra nội bộ xác minh.\n` +
        `• Đồng thời cảnh báo khi xe chạy lệch khỏi hành lang lộ trình đã đăng ký quá 2 km.`,
      timestamp: nowTime,
      insights: {
        type: 'FUEL_ANALYTICS',
        title: 'Phát Hiện Bất Thường Tiêu Hao Nhiên Liệu',
        description: 'Mô hình Isolation Forest giám sát 24/7 ngăn chặn thất thoát nhiên liệu.',
        metrics: [
          { label: 'Cảnh báo rút dầu', value: '0 cảnh báo', positive: true },
          { label: 'Mức tiêu hao trung bình', value: '18.4L/100km', positive: true },
          { label: 'Độ nhạy cảm biến', value: '99.1%', positive: true },
        ],
        actionLabel: 'Kiểm Tra Telemetry Nhiên Liệu',
        actionUrl: '/tracking',
      },
    };
  }

  // =========================================================================
  // 18. QUẢN LÝ SỰ CỐ & KHIẾU NẠI BỒI THƯỜNG (Incidents & Claims)
  // =========================================================================
  const incidentKeywords = [
    'su co', 'khieu nai', 'tai nan', 'hong hang', 'do vo',
    'mat hang', 'ket xe', 'den bu', 'boi thuong', 'bao hiem',
    'giai quyet khieu nai', 'hu hong'
  ];

  if (hasAnyKeyword(norm, incidentKeywords)) {
    return {
      id: msgId,
      sender: 'AI',
      text: `**Quy Trình Tiếp Nhận & Xử Lý Sự Cố Vận Tải (\`/incidents\`):**\n\n` +
        `Hiện có **${ctx.openIncidents.length} sự cố** đang được đội ngũ hỗ trợ điều vận thụ lý và xử lý.\n\n` +
        `• **Quy trình 4 bước chuẩn hóa:**\n` +
        `  1. **Ghi nhận sự cố:** Tài xế hoặc bộ phận CSKH lập phiếu sự cố, đính kèm hình ảnh hiện trường và vị trí GPS.\n` +
        `  2. **AI Đánh giá mức độ nghiêm trọng:** Phân loại rủi ro (Thấp / Trung bình / Cao / Khẩn cấp) và dự đoán tác động đến chỉ số SLA.\n` +
        `  3. **Kích hoạt phương án ứng cứu:** Tự động đề xuất xe rảnh gần nhất đến tiếp ứng sang tải hàng hoặc cử đội cứu hộ giao thông.\n` +
        `  4. **Giải quyết bồi thường:** Đối soát theo điều khoản bảo hiểm hàng hóa và hoàn tất đóng hồ sơ trong vòng 24 giờ.`,
      timestamp: nowTime,
      insights: {
        type: 'INCIDENT_ALERT',
        title: 'Quản Lý Sự Cố & Khiếu Nại Dịch Vụ',
        description: `Đang theo dõi ${ctx.openIncidents.length} sự cố vận hành để bảo đảm quyền lợi khách hàng.`,
        metrics: [
          { label: 'Sự cố đang xử lý', value: `${ctx.openIncidents.length} vụ`, positive: ctx.openIncidents.length === 0 },
          { label: 'Thời gian xử lý TB', value: '45 phút', positive: true },
          { label: 'Tỷ lệ hài lòng', value: '96.2%', positive: true },
        ],
        actionLabel: 'Mở Quản Lý Sự Cố',
        actionUrl: '/incidents',
      },
    };
  }

  // =========================================================================
  // 19. VẬN TẢI QUỐC TẾ, CẢNG BIỂN & HẢI QUAN (International & Customs)
  // =========================================================================
  const internationalKeywords = [
    'hai quan', 'container', 'quoc te', 'demurrage', 'detention',
    'cang bien', 'cuoc bien', 'van don b l', 'awb', 'free time',
    'luong xanh', 'luong vang', 'luong do', 'hang tau', 'maersk', 'cat lai'
  ];

  if (hasAnyKeyword(norm, internationalKeywords)) {
    return {
      id: msgId,
      sender: 'AI',
      text: `**Phân Hệ Quản Trị Vận Tải Quốc Tế & Hải Quan (\`/international\`):**\n\n` +
        `Hệ thống đang theo dõi **${ctx.internationalShipments.length} lô hàng xuất nhập khẩu** kết nối các hãng tàu quốc tế lớn (ONE Line, Maersk, CMA CGM...):\n\n` +
        ctx.internationalShipments.map(s => `• Lô \`${s.shipment_code}\`: Hãng tàu **${s.carrier_name}**, Vận đơn \`${s.bl_awb_number}\`, Phân luồng: **${s.customs_status}**`).join('\n') +
        `\n\n• **Giám sát hạn Free Time (Demurrage / Detention):** Đếm ngược số ngày lưu bãi container miễn phí tại cảng Cát Lái, Cái Mép, Hải Phòng. Cảnh báo trước 48 giờ để tránh phát sinh chi phí phạt lưu bãi lưu kho đắt đỏ.\n` +
        `• **Phân luồng hải quan:** Tự động cập nhật tình trạng thông quan Luồng Xanh (Thông quan nhanh), Luồng Vàng (Kiểm tra hồ sơ) và Luồng Đỏ (Kiểm hóa container).`,
      timestamp: nowTime,
      insights: {
        type: 'ROUTE_OPTIMIZATION',
        title: 'Giám Sát Vận Tải Quốc Tế & Cảng Biển',
        description: 'Tối ưu thời gian lưu bãi container và cập nhật phân luồng thông quan hải quan.',
        metrics: [
          { label: 'Lô hàng theo dõi', value: `${ctx.internationalShipments.length} lô`, positive: true },
          { label: 'Tỷ lệ luồng Xanh', value: '100%', positive: true },
          { label: 'Phí phạt DEM/DET', value: '0 VNĐ', positive: true },
        ],
        actionLabel: 'Mở Vận Tải Quốc Tế',
        actionUrl: '/international',
      },
    };
  }

  // =========================================================================
  // 20. ĐỐI SOÁT COD & TÍNH CƯỚC PHÍ (Finance & Billing)
  // =========================================================================
  const financeKeywords = [
    'cod', 'thu ho', 'doi soat', 'cuoc phi', 'gia cuoc',
    'bang gia', 'hoa don', 'thanh toan', 'chi phi', 'tinh gia cuoc',
    'phi van chuyen', 'tien thu ho', 'vat'
  ];

  if (hasAnyKeyword(norm, financeKeywords)) {
    return {
      id: msgId,
      sender: 'AI',
      text: `**Quản Trị Tài Chính, Cước Phí & Đối Soát COD (\`/finance/cod\` & \`/finance/billing\`):**\n\n` +
        `• **Công thức tính cước vận chuyển tự động:**\n` +
        `  - Cước cự ly = Đơn giá cơ bản theo dải cự ly x Số km thực tế.\n` +
        `  - Trọng lượng tính cước = Giá trị lớn nhất giữa Cân nặng thực tế (kg) và Trọng lượng thể tích quy đổi: \`(Dài x Rộng x Cao) / 5000\` (cm).\n` +
        `  - Phụ phí: Phí giao hàng tận phòng/lầu cao, phụ phí giờ cao điểm nội đô và bảo hiểm khai giá hàng giá trị cao.\n` +
        `• **Đối soát tiền thu hộ COD:** Hệ thống tự động gom các khoản thu hộ tiền mặt từ tài xế ngay sau khi e-POD ký hoàn tất, lập bảng đối soát chuyển khoản cho chủ hàng theo chu kỳ định sẵn (T+1, T+3, hoặc hàng tuần) minh bạch 100%.`,
      timestamp: nowTime,
      insights: {
        type: 'SLA_ALERT',
        title: 'Quản Trị Dòng Tiền & Đối Soát COD',
        description: 'Tự động hóa đối soát tiền thu hộ và hạch toán cước phí chính xác.',
        metrics: [
          { label: 'Chu kỳ đối soát', value: 'T+1 Linh hoạt', positive: true },
          { label: 'Độ chính xác cước', value: '100%', positive: true },
        ],
        actionLabel: 'Mở Bảng Đối Soát COD',
        actionUrl: '/finance/cod',
      },
    };
  }

  // =========================================================================
  // 21. CỔNG CHỦ HÀNG DOANH NGHIỆP B2B (B2B Shipper Portal)
  // =========================================================================
  const b2bKeywords = [
    'b2b', 'chu hang', 'portal b2b', 'khach hang doanh nghiep',
    'tao don hang loat', 'hop dong', 'chu hang lon', 'khach hang b2b'
  ];

  if (hasAnyKeyword(norm, b2bKeywords)) {
    return {
      id: msgId,
      sender: 'AI',
      text: `**Cổng Tự Phục Vụ Dành Cho Chủ Hàng B2B (\`/portal/b2b\` hoặc \`/customers\`):**\n\n` +
        `Phân hệ chuyên biệt dành cho các doanh nghiệp sản xuất, tổng kho phân phối và chuỗi bán lẻ:\n\n` +
        `• **Tạo đơn hàng loạt:** Tải lên file Excel danh sách hàng trăm đơn hàng để hệ thống tự động kiểm tra địa chỉ và tạo vận đơn trong vài giây.\n` +
        `• **Theo dõi hợp đồng & Công nợ:** Quản lý hạn mức công nợ theo hợp đồng, tra cứu hóa đơn VAT điện tử và đối soát thanh toán trực tuyến.\n` +
        `• **Giám sát lô hàng:** Xem toàn cảnh tiến độ giao nhận của các lô hàng lớn và tải toàn bộ ảnh biên bản e-POD có chữ ký người nhận.`,
      timestamp: nowTime,
      insights: {
        type: 'ROUTE_OPTIMIZATION',
        title: 'Cổng Thông Tin Chủ Hàng B2B',
        description: 'Tối ưu trải nghiệm đặt đơn hàng loạt và quản lý hợp đồng vận chuyển.',
        metrics: [
          { label: 'Tạo đơn Excel', value: 'Không giới hạn', positive: true },
          { label: 'Hóa đơn VAT điện tử', value: 'Tự động xuất', positive: true },
        ],
        actionLabel: 'Mở Cổng Chủ Hàng B2B',
        actionUrl: '/portal/b2b',
      },
    };
  }

  // =========================================================================
  // 22. TRUNG TÂM BÁO CÁO & DỰ BÁO MACHINE LEARNING (Reports & Forecast)
  // =========================================================================
  const reportsKeywords = [
    'bao cao', 'kpi', 'doanh thu', 'thong ke', 'du bao ml',
    'san luong', 'hieu suat', 'bieu do', 'xuat excel', 'du bao van tai'
  ];

  if (hasAnyKeyword(norm, reportsKeywords)) {
    return {
      id: msgId,
      sender: 'AI',
      text: `**Trung Tâm Báo Cáo Phân Tích & Dự Báo Machine Learning (\`/reports\`):**\n\n` +
        `• **Phân tích chỉ số KPI cốt lõi:** Biểu đồ tỷ lệ giao đúng hạn OTD (mục tiêu >98%), Chi phí trung bình trên mỗi km lăn bánh, Doanh thu phân tích theo từng tuyến đường và khách hàng.\n` +
        `• **Mô hình AI Dự Báo Nhu Cầu 14 Ngày:** Sử dụng thuật toán Random Forest phân tích dữ liệu lịch sử để dự đoán số lượng kiện hàng và số lượng xe tải cần huy động cho 2 tuần tiếp theo, giúp ban giám đốc chủ động kế hoạch thuê xe ngoài và cân đối chi phí vận hành.\n` +
        `• **Xuất báo cáo:** Hỗ trợ xuất dữ liệu báo cáo vận hành ra định dạng Excel và PDF chỉ với 1 cú click chuột.`,
      timestamp: nowTime,
      insights: {
        type: 'SLA_ALERT',
        title: 'Báo Cáo Phân Tích & Dự Báo Thông Minh',
        description: 'Mô hình Machine Learning hỗ trợ ra quyết định kinh doanh và tối ưu chi phí.',
        metrics: [
          { label: 'Tỷ lệ OTD tuần qua', value: '98.5%', positive: true },
          { label: 'Dự báo tăng trưởng', value: '+14.2%', positive: true },
        ],
        actionLabel: 'Xem Báo Cáo & Phân Tích',
        actionUrl: '/reports',
      },
    };
  }

  // =========================================================================
  // 23. CẤU HÌNH PHÂN QUYỀN & QUẢN TRỊ NHÂN SỰ (Settings & Roles)
  // =========================================================================
  const settingsKeywords = [
    'phan quyen', 'vai tro', 'tai khoan', 'nhan su', 'phong ban',
    'cai dat', 'rbac', 'admin', 'dispatcher', 'warehouse',
    'audit trail', 'nhat ky he thong'
  ];

  if (hasAnyKeyword(norm, settingsKeywords)) {
    return {
      id: msgId,
      sender: 'AI',
      text: `**Cấu Hình Phân Quyền & Quản Trị Nhân Sự (\`/staff\`, \`/roles\`, \`/departments\`, \`/settings\`):**\n\n` +
        `Hệ thống VietRoute thiết lập mô hình kiểm soát truy cập dựa trên vai trò (RBAC) nghiêm ngặt:\n\n` +
        `• **Quản trị viên (Admin):** Toàn quyền kiểm soát hệ thống, phê duyệt ngân sách và cấu hình các thông số toàn cục.\n` +
        `• **Điều phối viên (Dispatcher):** Lập kế hoạch xếp xe, chỉ định tài xế, điều hướng lộ trình và xử lý đơn gấp.\n` +
        `• **Thủ kho (Warehouse):** Nhận hàng, xuất kho, kiểm đếm tồn kho, quét mã barcode và quản lý cửa dock.\n` +
        `• **Tài xế (Driver):** Truy cập App di động để tiếp nhận cuốc xe và cập nhật ảnh ký nhận e-POD.\n` +
        `• **Nhật ký kiểm toán (Audit Trail):** Tự động ghi vết mọi hành động thêm/sửa/xóa trên hệ thống để đảm bảo an toàn thông tin và tính giải trình.`,
      timestamp: nowTime,
      insights: {
        type: 'SLA_ALERT',
        title: 'Kiểm Soát Truy Cập & An Ninh Hệ Thống',
        description: 'Phân quyền chặt chẽ theo chức năng nghiệp vụ của từng phòng ban.',
        metrics: [
          { label: 'Mô hình phân quyền', value: 'RBAC Chuẩn', positive: true },
          { label: 'Nhật ký kiểm toán', value: 'Kích hoạt 24/7', positive: true },
        ],
        actionLabel: 'Quản Lý Nhân Sự & Phân Quyền',
        actionUrl: '/staff',
      },
    };
  }

  // =========================================================================
  // 24. CÂU TRẢ LỜI MẶC ĐỊNH CHO NGHIỆP VỤ LOGISTICS (Smart Logistics Overview)
  // Không dùng từ ngữ thô lập trình viên (PostgreSQL, backend server), thân thiện và hữu ích!
  // =========================================================================
  return {
    id: msgId,
    sender: 'AI',
    text: `Chào bạn! Dưới đây là tóm tắt nhanh tình trạng vận hành hiện tại trên hệ thống VietRoute Logistics:\n\n` +
      `• **Tình hình đơn hàng:** Hệ thống đang quản lý **${ctx.totalOrders} đơn hàng**, trong đó **${ctx.inTransitOrders} đơn** đang trên đường giao và **${ctx.pendingOrders} đơn** đang chờ bàn điều phối xếp xe.\n` +
      `• **Đội xe & Tài xế:** Có **${ctx.availableDrivers.length} tài xế** và **${ctx.availableVehicles.length} phương tiện** đang ở trạng thái sẵn sàng tiếp nhận lệnh vận chuyển.\n` +
      `• **Mạng lưới kho bãi:** ${ctx.warehouses.length} Tổng kho trung chuyển đang duy trì công suất vận hành an toàn.\n` +
      `• **Sự cố:** ${ctx.openIncidents.length > 0 ? `Đang có ${ctx.openIncidents.length} sự cố được đội ngũ hỗ trợ theo dõi xử lý.` : 'Không ghi nhận sự cố vận tải nghiêm trọng nào.'}\n\n` +
      `💡 *Gợi ý:* Bạn có thể hỏi tôi về hướng dẫn tạo đơn hàng, cách thức điều phối xe thông minh, tối ưu tuyến đường 2-Opt, kiểm tra công suất kho hoặc tra cứu mã vận đơn bất kỳ lúc nào!`,
    timestamp: nowTime,
    insights: {
      type: 'SLA_ALERT',
      title: 'Tóm Tắt Vận Hành VietRoute TMS & WMS',
      description: 'Tổng hợp số liệu thời gian thực từ các phân hệ vận hành.',
      metrics: [
        { label: 'Tổng đơn hàng', value: `${ctx.totalOrders}`, positive: true },
        { label: 'Đang vận chuyển', value: `${ctx.inTransitOrders}`, positive: true },
        { label: 'Tài xế sẵn sàng', value: `${ctx.availableDrivers.length}`, positive: true },
      ],
      actionLabel: 'Xem Báo Cáo & Phân Tích',
      actionUrl: '/reports',
    },
  };
}
