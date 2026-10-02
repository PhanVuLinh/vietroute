export interface LocalAiResponse {
  text: string;
  insights?: {
    type: 'SLA_ALERT' | 'ROUTE_OPTIMIZATION' | 'DRIVER_DISPATCH' | 'FUEL_ANALYTICS' | 'WAREHOUSE_OVERLOAD' | 'INCIDENT_ALERT';
    title: string;
    description: string;
    metrics?: { label: string; value: string; positive?: boolean }[];
    actionLabel?: string;
    actionUrl?: string;
  };
}

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

function hasAnyKeyword(normalized: string, keywords: string[]): boolean {
  return keywords.some(kw => {
    const normKw = normalizeVietnamese(kw);
    return normalized.includes(normKw);
  });
}

/**
 * Động cơ Tri Thức & Xử Lý Ý Định Hội Thoại Logistics VietRoute Copilot (Phía Client)
 * 100% Thuần Nội Bộ - Không gọi API AI bên ngoài
 */
export function generateVietRouteLocalAiResponse(rawPrompt: string): LocalAiResponse {
  const norm = normalizeVietnamese(rawPrompt);

  // 1. OUT OF SCOPE GUARD
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
      insights: {
        type: 'SLA_ALERT',
        title: 'Trợ Lý Nghiệp Vụ Vận Tải VietRoute',
        description: 'Chuyên trách hỗ trợ 100% nghiệp vụ quản trị vận tải và kho bãi nội bộ.',
        metrics: [
          { label: 'Phân hệ hỗ trợ', value: '12 Phân hệ', positive: true },
          { label: 'Phạm vi', value: 'Nội bộ VietRoute', positive: true },
        ],
        actionLabel: 'Xem Bảng Điều Khiển',
        actionUrl: '/dashboard',
      },
    };
  }

  // 2. GREETING
  const greetingKeywords = [
    'xin chao', 'chao ban', 'chao copilot', 'chao tro ly', 'chao ad',
    'chao em', 'chao anh', 'chao chi', 'hello', 'hi copilot', 'hi bot', 'hi ai',
    'alo', 'good morning', 'good afternoon', 'chao nhe'
  ];

  if (hasAnyKeyword(norm, greetingKeywords) && norm.length < 35) {
    return {
      text: `Xin chào! Tôi là **VietRoute AI Copilot** — Trợ lý Trí tuệ Nhân tạo vận hành chuyên biệt cho Nền tảng Quản trị Vận tải & Kho bãi VietRoute.\n\n` +
        `Tôi có thể đồng hành và hỗ trợ bạn xử lý nhanh các tác vụ:\n\n` +
        `1. **Quản lý Đơn hàng & Điều phối:** Hướng dẫn tạo đơn, rà soát đơn gấp vi phạm SLA, tự động chấm điểm gán tài xế (AI Match Score).\n` +
        `2. **Tối ưu hóa Lộ trình (2-Opt TSP):** Quy hoạch tuyến giao đa điểm dừng, né khung giờ cấm tải đô thị và tiết kiệm chi phí nhiên liệu.\n` +
        `3. **Kho bãi WMS & Xếp hàng 3D:** Giám sát tỷ lệ lấp đầy 4 Tổng kho, mô phỏng xếp hàng 3D theo nguyên tắc LIFO và trọng tâm xe.\n` +
        `4. **Giám sát Xe & An toàn:** Theo dõi vị trí GPS thời gian thực, phát hiện bất thường sụt giảm nhiên liệu (chống thất thoát dầu).\n` +
        `5. **Vận tải Quốc tế & Tài chính:** Giám sát hạn lưu bãi container (Demurrage), đối soát COD và tính toán cước phí.\n\n` +
        `Bạn đang cần hỗ trợ xử lý nghiệp vụ nào trên hệ thống?`,
      insights: {
        type: 'SLA_ALERT',
        title: 'VietRoute Logistics Copilot',
        description: 'Trợ lý AI sẵn sàng hỗ trợ điều hành vận tải và tối ưu hóa chuỗi cung ứng.',
        metrics: [
          { label: 'Tài xế sẵn sàng', value: '5 tài xế', positive: true },
          { label: 'Xe rảnh bãi', value: '8 xe', positive: true },
          { label: 'OTD toàn mạng', value: '98.5%', positive: true },
        ],
        actionLabel: 'Tới Bàn Điều Phối',
        actionUrl: '/dispatch',
      },
    };
  }

  // 3. CAPABILITIES & HELP
  const capabilitiesKeywords = [
    'ban la ai', 'ban lam duoc gi', 'chuc nang cua ban', 'ai nay la gi',
    'huong dan su dung web', 'website co gi', 'he thong gom nhung gi',
    'gioi thieu web', 'tro giup', 'menu co gi', 'tinh nang web', 'huong dan tong quan',
    'huong dan dung web', 'cach dung web'
  ];

  if (hasAnyKeyword(norm, capabilitiesKeywords)) {
    return {
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
      insights: {
        type: 'ROUTE_OPTIMIZATION',
        title: 'Cẩm Nang Vận Hành Hệ Thống VietRoute',
        description: 'Tích hợp đầy đủ các phân hệ quản lý vận tải đường bộ, kho bãi và giao nhận chặng cuối.',
        metrics: [
          { label: 'Kho trung chuyển', value: '4 Hub', positive: true },
          { label: 'OTD toàn mạng', value: '98.5%', positive: true },
        ],
        actionLabel: 'Mở Bảng Điều Khiển',
        actionUrl: '/dashboard',
      },
    };
  }

  // 4. ORDER CREATION
  const orderCreationKeywords = [
    'tao don', 'lap don', 'nhap don', 'them don', 'tao van don',
    'dat don', 'cach tao don', 'huong dan tao don', 'tao don moi',
    'them don hang', 'lap van don', 'nhap don hang'
  ];

  if (hasAnyKeyword(norm, orderCreationKeywords)) {
    return {
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
      insights: {
        type: 'SLA_ALERT',
        title: 'Tạo Đơn Hàng & Cấp Mã Vận Đơn',
        description: 'Đơn hàng mới tạo sẽ tức thời được ghi nhận vào hàng đợi điều phối.',
        metrics: [
          { label: 'Quy trình', value: '4 Bước chuẩn', positive: true },
          { label: 'Mã vận đơn', value: 'VR-2026-XXXX', positive: true },
        ],
        actionLabel: 'Tới Trang Quản Lý Đơn Hàng',
        actionUrl: '/orders',
      },
    };
  }

  // 5. TRACKING LOOKUP
  const trackingLookupKeywords = [
    'tra cuu', 'tra don', 'tim don', 'theo doi don', 'kiem tra don',
    'don hang o dau', 'ma van don', 'ma don', 'tra van don', 'vr '
  ];

  if (hasAnyKeyword(norm, trackingLookupKeywords) || norm.includes('vr-') || norm.includes('vr2026')) {
    return {
      text: `**Quy trình Tra cứu Đơn Hàng & Hành Trình Vận Chuyển:**\n\n` +
        `• **Tra cứu nội bộ (Dành cho Điều phối viên & Quản trị viên):**\n` +
        `  1. Nhấn tổ hợp phím **Ctrl + K** (hoặc bấm vào ô tìm kiếm ở thanh tiêu đề trên cùng) để mở tìm kiếm nhanh.\n` +
        `  2. Nhập mã vận đơn (ví dụ: \`VR-2026-001\`) hoặc SĐT người nhận để xem chi tiết tình trạng đơn.\n` +
        `  3. Hoặc vào trang **Đơn hàng** (\`/orders\`) sử dụng bộ lọc trạng thái và ngày tạo.\n\n` +
        `• **Tra cứu công khai (Dành cho Khách hàng / Người nhận):**\n` +
        `  Khách hàng có thể truy cập trang **Tra cứu công khai** (\`/track\`) mà không cần đăng nhập tài khoản. Chỉ cần nhập mã vận đơn để xem bản đồ trực tuyến vị trí tài xế, thời gian dự kiến giao (ETA) và ảnh chụp ký nhận e-POD khi hoàn tất.`,
      insights: {
        type: 'ROUTE_OPTIMIZATION',
        title: 'Cổng Tra Cứu Hành Trình Vận Đơn',
        description: 'Hỗ trợ tra cứu nhanh trạng thái đơn hàng và vị trí xe theo thời gian thực.',
        metrics: [
          { label: 'Trang công khai', value: '/track', positive: true },
          { label: 'Thời gian thực', value: 'Cập nhật 10s', positive: true },
        ],
        actionLabel: 'Mở Trang Tra Cứu Vận Đơn',
        actionUrl: '/track',
      },
    };
  }

  // 6. ORDER STATUS LIFECYCLE
  const orderStatusKeywords = [
    'trang thai don', 'quy trinh don', 'vong doi don', 'pending la gi',
    'in transit la gi', 'in_transit', 'delivered la gi', 'assigned la gi',
    'cac trang thai don', 'y nghia trang thai'
  ];

  if (hasAnyKeyword(norm, orderStatusKeywords)) {
    return {
      text: `**Quy trình 6 trạng thái trong Vòng Đời Đơn Hàng VietRoute:**\n\n` +
        `1. **PENDING (Chờ xử lý):** Đơn hàng mới được tạo trên hệ thống, đang chờ điều phối viên duyệt thông tin và phân bổ phương tiện.\n` +
        `2. **CONFIRMED (Đã xác nhận):** Đơn hợp lệ, Tổng kho xuất hàng bắt đầu in mã barcode và đóng gói kiện hàng.\n` +
        `3. **ASSIGNED (Đã gán xe):** Đã chỉ định phương tiện và tài xế qua thuật toán AI Match Score. Tài xế nhận thông báo lệnh chạy trên App.\n` +
        `4. **IN_TRANSIT (Đang vận chuyển):** Xe tải đã xuất bến và đang di chuyển trên lộ trình đến địa chỉ người nhận. Hệ thống kích hoạt chia sẻ GPS.\n` +
        `5. **DELIVERED (Giao thành công):** Người nhận đã nhận hàng và ký xác nhận trên biên bản điện tử e-POD. Trạng thái kết thúc thành công.\n` +
        `6. **CANCELLED (Đã hủy):** Đơn bị hủy do khách hàng thay đổi yêu cầu hoặc do sự cố không thể khắc phục.`,
      insights: {
        type: 'SLA_ALERT',
        title: 'Chuẩn Hóa Vòng Đời Trạng Thái Đơn Hàng',
        description: 'Mọi thay đổi trạng thái đều được lưu nhật ký kiểm toán (Audit Log) minh bạch.',
        metrics: [
          { label: 'Số bước trạng thái', value: '6 Trạng thái', positive: true },
          { label: 'Ký nhận e-POD', value: 'Tự động', positive: true },
        ],
        actionLabel: 'Xem Danh Sách Đơn',
        actionUrl: '/orders',
      },
    };
  }

  // 7. DISPATCH
  const dispatchKeywords = [
    'dieu phoi', 'gan xe', 'gan tai xe', 'phan bo', 'ban dieu phoi',
    'ghep don', 'xep xe', 'cach phan bo', 'chon tai xe', 'dieu xe'
  ];

  if (hasAnyKeyword(norm, dispatchKeywords)) {
    return {
      text: `**Hướng dẫn vận hành Bàn Điều Phối Vận Tải (\`/dispatch\`):**\n\n` +
        `1. **Giao diện bàn điều phối:**\n` +
        `   • Cột bên trái: Danh sách các đơn hàng đang chờ giao (\`PENDING\`), có gắn nhãn ưu tiên và thời hạn cam kết SLA.\n` +
        `   • Cột bên phải: Danh sách Đội xe và Tài xế đang ở trạng thái trực tuyến sẵn sàng (\`AVAILABLE\`).\n` +
        `2. **Phương thức phân bổ:**\n` +
        `   • **Tự động phân bổ bằng AI (Khuyên dùng):** Bấm nút **'Tự động phân bổ AI'**. Hệ thống sẽ chạy mô hình học máy \`driver_match_model\` để ghép đơn vào tài xế có điểm Match Score cao nhất.\n` +
        `   • **Điều phối thủ công:** Kéo thả thẻ đơn hàng trực tiếp vào ô phương tiện/tài xế mong muốn.\n` +
        `3. **Gửi lệnh:** Sau khi gán, bấm **'Xác nhận điều phối'** — Tài xế sẽ nhận được thông báo lệnh vận chuyển kèm lộ trình tối ưu trên App điện thoại.`,
      insights: {
        type: 'DRIVER_DISPATCH',
        title: 'Bàn Điều Phối Đội Xe Thông Minh',
        description: 'Hỗ trợ điều phối tự động và thủ công linh hoạt theo nhu cầu vận tải.',
        metrics: [
          { label: 'Tài xế sẵn sàng', value: '5 tài xế', positive: true },
          { label: 'Xe rảnh bãi', value: '8 xe', positive: true },
        ],
        actionLabel: 'Mở Bàn Điều Phối',
        actionUrl: '/dispatch',
      },
    };
  }

  // 8. AI MATCH SCORE
  const matchScoreKeywords = [
    'match score', 'cham diem tai xe', 'tieu chi gan xe', 'thuat toan dieu phoi',
    'mo hinh driver match', 'tieu chi cham diem'
  ];

  if (hasAnyKeyword(norm, matchScoreKeywords)) {
    return {
      text: `**Thuật Toán Chấm Điểm Ghép Nối Tài Xế (AI Driver Match Score):**\n\n` +
        `Mô hình Machine Learning nội bộ của VietRoute (\`driver_match_model.joblib\`) tính toán điểm tương thích từ **0 đến 100 điểm** dựa trên 4 trọng số nghiệp vụ cốt lõi:\n\n` +
        `1. **Khoảng cách tiếp cận (Trọng số 35%):** Đo bán kính GPS thực tế từ vị trí hiện tại của xe đến kho lấy hàng. Cự ly càng ngắn điểm càng cao.\n` +
        `2. **Tải trọng & Thể tích còn trống (Trọng số 25%):** Đảm bảo kiện hàng nằm trong giới hạn tải trọng cho phép của thùng xe, tối ưu tỷ lệ lấp đầy.\n` +
        `3. **Chỉ số đúng giờ OTD của tài xế (Trọng số 25%):** Ưu tiên các bác tài có lịch sử giao hàng đúng hạn trên 98% và điểm đánh giá sao cao.\n` +
        `4. **Phù hợp Giấy phép Lái xe (Trọng số 15%):** Kiểm tra hạng bằng lái (B2 cho xe Van, Hạng C cho xe tải 5T - 8T, Hạng FC cho xe đầu kéo Container) đảm bảo tuân thủ 100% quy định pháp luật.`,
      insights: {
        type: 'DRIVER_DISPATCH',
        title: 'Mô Hình Ghép Nối Tài Xế Học Máy',
        description: 'Tối ưu hóa khả năng đáp ứng cuốc xe và nâng cao chỉ số phục vụ khách hàng.',
        metrics: [
          { label: 'Độ chính xác Match', value: '94.2%', positive: true },
          { label: 'Trọng số cự ly', value: '35%', positive: true },
          { label: 'Trọng số OTD', value: '25%', positive: true },
        ],
        actionLabel: 'Kiểm Tra Bàn Điều Phối',
        actionUrl: '/dispatch',
      },
    };
  }

  // 9. SLA ALERT
  const slaKeywords = [
    'sla', 'tre', 'nguy co', 'cham', 'khan cap', 'don gap', 'vi pham sla',
    'qua han', 'otd'
  ];

  if (hasAnyKeyword(norm, slaKeywords)) {
    return {
      text: `**Rà Soát Nguy Cơ Vi Phạm Cam Kết Giao Hàng (SLA) Toàn Mạng:**\n\n` +
        `Hệ thống AI đã quét toàn bộ hàng đợi vận hành và phát hiện **3 đơn hàng ưu tiên cao** cần xử lý khẩn cấp:\n\n` +
        `• **Đơn \`VR-2026-001\`:** Tổng kho Tân Bình → Quận 1 (Cam kết 17:00, còn 45 phút)\n` +
        `• **Đơn \`VR-2026-004\`:** Kho Sóng Thần → Thủ Đức (Cam kết 16:30, còn 15 phút)\n\n` +
        `• **Tình hình lưu thông:** Toàn mạng đang có **24 đơn** vận chuyển đúng tiến độ, chỉ số OTD duy trì ở mức **98.4%**.\n` +
        `• **Khuyến nghị AI:** Ưu tiên chỉ định xe tải Van xuất bến ngay cho các đơn hàng khẩn cấp nêu trên để tránh bị phạt cam kết thời gian.`,
      insights: {
        type: 'SLA_ALERT',
        title: 'Cảnh Báo Rủi Ro Vi Phạm SLA Đơn Hàng',
        description: 'Phát hiện 3 đơn hàng cần ưu tiên cấp xe để đảm bảo đúng tiến độ cam kết.',
        metrics: [
          { label: 'Đơn nguy cơ', value: '3 đơn', positive: false },
          { label: 'OTD hôm nay', value: '98.4%', positive: true },
        ],
        actionLabel: 'Xử Lý Đơn Gấp Ngay',
        actionUrl: '/dispatch',
      },
    };
  }

  // 10. ROUTE OPTIMIZATION
  const routeKeywords = [
    'tuyen', 'toi uu tuyen', 'lo trinh', 'cung duong', '2 opt', '2-opt',
    'tsp', 'duong cam', 'tiet kiem xang', 'tram bot', 'thu phi bot'
  ];

  if (hasAnyKeyword(norm, routeKeywords)) {
    return {
      text: `**Phân Hệ Tối Ưu Hóa Tuyến Đường Đa Điểm Dừng (\`/routes\`):**\n\n` +
        `Hệ thống sử dụng giải thuật **2-Opt TSP & Heuristic Clustered Routing** chuyên biệt cho bài toán giao hàng chặng cuối (Last-Mile Delivery):\n\n` +
        `• **Gom cụm đơn hàng:** Phân cụm các điểm giao hàng có cùng khu vực địa lý, sắp xếp thứ tự điểm dừng thành một vòng cung khép kín nhằm loại bỏ hoàn toàn các đoạn đường đi lặp lại.\n` +
        `• **Hiệu quả định lượng:** Rút ngắn trung bình **15% - 28% tổng quãng đường** (tiết kiệm khoảng 12.4 km cho mỗi ca chạy), giảm 3.5 - 5.0 Lít dầu diesel và cắt giảm 12.8 kg khí thải CO2.\n` +
        `• **Tự động né giờ cấm tải:** Nhận diện và tự động điều hướng tránh các trục đường cấm xe tải trên 2.5 Tấn theo khung giờ đô thị tại TP.HCM (06h-09h và 16h-20h) và Hà Nội.\n` +
        `• **Dự toán chi phí trạm thu phí BOT:** Tự động tính toán các trạm thu phí trên tuyến đường để hạch toán chi phí chuyến xe chính xác nhất.`,
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

  // 11. WAREHOUSES
  const warehouseKeywords = [
    'kho', 'kho bai', 'wms', 'suc chua', 'lap day', 'ton kho',
    'nhap kho', 'xuat kho', 'dock', 'hub', 'tan binh', 'song than',
    'cat lai', 'noi bai'
  ];

  if (hasAnyKeyword(norm, warehouseKeywords)) {
    return {
      text: `**Báo Cáo Tình Hình Mạng Lưới Kho Bãi VietRoute WMS (\`/warehouses\`):**\n\n` +
        `Hệ thống đang giám sát và quản lý **4 Tổng kho trung chuyển chiến lược**:\n\n` +
        `• **Tổng kho Tân Bình (TP.HCM):** Sử dụng 750/1000 Tấn (**75.0%**) ⚠️ *(Cảnh báo tải cao)*\n` +
        `• **Kho Trung chuyển Sóng Thần (Bình Dương):** Sử dụng 620/1200 Tấn (**51.7%**) *(Ổn định)*\n` +
        `• **Kho ICD Cát Lái (Cảng biển):** Sử dụng 480/800 Tấn (**60.0%**) *(Ổn định)*\n` +
        `• **Tổng kho Nội Bài (Hà Nội):** Sử dụng 510/900 Tấn (**56.7%**) *(Ổn định)*\n\n` +
        `• **Dự báo nhu cầu lưu kho AI:** Tích hợp mô hình Random Forest dự báo lưu lượng hàng hóa xuất nhập trong 14 ngày tới để chủ động bố trí nhân lực nhặt hàng (picking) và diện tích lưu trữ.\n` +
        `• **Khuyến nghị AI:** Tiến hành lệnh điều chuyển hàng nội bộ (Stock Transfer) từ Tân Bình sang Sóng Thần để giải tỏa áp lực cửa Dock.`,
      insights: {
        type: 'WAREHOUSE_OVERLOAD',
        title: 'Báo Cáo Tỷ Lệ Lấp Đầy Kho Bãi',
        description: 'Tổng kho Tân Bình đang có tỷ lệ lấp đầy 75%. Đề xuất điều chuyển hàng sang Sóng Thần.',
        metrics: [
          { label: 'Tổng kho giám sát', value: '4 Hub', positive: true },
          { label: 'Tải trung bình', value: '60.8%', positive: true },
        ],
        actionLabel: 'Mở Quản Lý Kho WMS',
        actionUrl: '/warehouses',
      },
    };
  }

  // 12. LOAD 3D OPTIMIZATION
  const load3dKeywords = [
    'xep hang 3d', 'thung xe 3d', '3d', 'lifo', 'trong tam',
    'center of gravity', 'chat xep', 'xep hang len xe', 'mo hinh 3d',
    'xep hang'
  ];

  if (hasAnyKeyword(norm, load3dKeywords)) {
    return {
      text: `**Phân Hệ Xếp Hàng 3D Lên Thùng Xe (\`/load-optimizer\`):**\n\n` +
        `Hệ thống trực quan hóa mô hình 3D lòng thùng xe tải và container, hỗ trợ giải quyết bài toán xếp dỡ tối ưu:\n\n` +
        `• **Nguyên tắc LIFO (Last-In, First-Out):** Kiện hàng giao cho điểm dừng cuối cùng sẽ được xếp sâu nhất vào bên trong; kiện hàng giao đầu tiên xếp ngay sát cửa thùng xe để bốc dỡ nhanh chóng mà không cần đảo chuyển xáo trộn hàng hóa.\n` +
        `• **Cân bằng trọng tâm xe (Center of Gravity):** Thuật toán tự động phân bổ các kiện hàng có khối lượng nặng ở dưới sàn và nằm giữa 2 trục bánh xe, các kiện nhẹ xếp lên trên, ngăn ngừa triệt để nguy cơ nghiêng lật xe khi vào cua hoặc vượt đèo dốc.\n` +
        `• **Mô phỏng 3D xoay 360°:** Điều phối viên và công nhân bốc xếp có thể quan sát trực tiếp mô hình thùng xe từ mọi góc độ để hướng dẫn thao tác xếp hàng thực tế chuẩn xác.`,
      insights: {
        type: 'ROUTE_OPTIMIZATION',
        title: 'Mô Phỏng Xếp Hàng 3D Thùng Xe',
        description: 'Tối ưu hóa thể tích thùng hàng và bảo đảm an toàn trọng tâm xe.',
        metrics: [
          { label: 'Tỷ lệ lấp đầy thể tích', value: '88.5%', positive: true },
          { label: 'Quy tắc dỡ hàng', value: 'LIFO Chuẩn', positive: true },
        ],
        actionLabel: 'Mở Xếp Hàng 3D',
        actionUrl: '/load-optimizer',
      },
    };
  }

  // 13. FLEET
  const fleetKeywords = [
    'xe tai', 'doi xe', 'phuong tien', 'bao duong xe', 'dang kiem',
    'tai trong xe', 'xe ranh', 'bai xe', 'xe van', 'xe container'
  ];

  if (hasAnyKeyword(norm, fleetKeywords)) {
    return {
      text: `**Quản Trị Đội Xe Vận Tải VietRoute (\`/fleet\`):**\n\n` +
        `• Toàn hệ thống hiện có **8 phương tiện** đang ở trạng thái **RẢNH BÃI (AVAILABLE)** sẵn sàng tiếp nhận lệnh vận chuyển.\n` +
        `• **Phân loại phương tiện:**\n` +
        `  - Xe Van đô thị (1.0 - 1.5 Tấn): Linh hoạt giao hàng nội đô, luồn lách ngõ hẻm.\n` +
        `  - Xe tải thùng kín (2.5T, 5.0T, 8.0T): Vận chuyển liên tỉnh và kết nối mạng lưới kho.\n` +
        `  - Xe đầu kéo Container (20ft, 40ft): Phục vụ hàng xuất nhập khẩu tại cảng biển.\n` +
        `• **Giám sát đăng kiểm & bảo dưỡng:** Tự động cảnh báo trước 15 ngày khi xe sắp hết hạn Đăng kiểm hoặc Bảo hiểm TNDS bắt buộc, đồng thời nhắc lịch thay dầu phanh định kỳ theo số km thực tế.`,
      insights: {
        type: 'DRIVER_DISPATCH',
        title: 'Hiện Trạng Đội Xe Vận Tải',
        description: 'Theo dõi tình trạng sẵn sàng và bảo dưỡng kỹ thuật định kỳ.',
        metrics: [
          { label: 'Xe rảnh bãi', value: '8 xe', positive: true },
          { label: 'Tỷ lệ sẵn sàng', value: '92.0%', positive: true },
        ],
        actionLabel: 'Xem Quản Lý Đội Xe',
        actionUrl: '/fleet',
      },
    };
  }

  // 14. DRIVERS
  const driversKeywords = [
    'tai xe', 'lai xe', 'bang lai', 'hang c', 'hang fc', 'hang b2',
    'danh gia tai xe', 'cham cong', 'otd tai xe', 'ho so tai xe'
  ];

  if (hasAnyKeyword(norm, driversKeywords)) {
    return {
      text: `**Quản Lý Đội Ngũ Tài Xế VietRoute (\`/drivers\`):**\n\n` +
        `• Hiện có **5 tài xế** đang ở trạng thái **SẴN SÀNG (AVAILABLE)** và **2 tài xế** đang thực hiện ca giao hàng.\n` +
        `• **Tài xế tiêu biểu:** **Hoàng Đức Thắng** (Xe 51C-882.14) — Đánh giá: 4.9★, Tỷ lệ đúng giờ OTD: **99.1%**\n` +
        `• **Chỉ số hiệu suất OTD (On-Time Delivery):** Hệ thống tự động ghi nhận tỷ lệ giao hàng đúng hẹn và đánh giá sao từ khách hàng để xét thưởng năng suất hàng tháng.\n` +
        `• **Quy định an toàn:** Giám sát thời gian lái xe liên tục không quá 4 giờ và không vượt quá 10 giờ/ngày theo đúng Luật Giao thông Đường bộ.`,
      insights: {
        type: 'DRIVER_DISPATCH',
        title: 'Nguồn Lực Đội Ngũ Tài Xế',
        description: 'Tài xế sẵn sàng nhận đơn với xếp hạng hiệu suất cao.',
        metrics: [
          { label: 'Tài xế sẵn sàng', value: '5 người', positive: true },
          { label: 'OTD trung bình', value: '98.5%', positive: true },
        ],
        actionLabel: 'Xem Danh Sách Tài Xế',
        actionUrl: '/drivers',
      },
    };
  }

  // 15. DEFAULT FALLBACK LOGISTICS
  return {
    text: `Chào bạn! Dưới đây là tóm tắt nhanh tình trạng vận hành hiện tại trên hệ thống VietRoute Logistics:\n\n` +
      `• **Tình hình đơn hàng:** Hệ thống đang quản lý **120 đơn hàng**, trong đó **24 đơn** đang trên đường giao và **8 đơn** đang chờ bàn điều phối xếp xe.\n` +
      `• **Đội xe & Tài xế:** Có **5 tài xế** và **8 xe tải** đang ở trạng thái sẵn sàng tiếp nhận lệnh vận chuyển.\n` +
      `• **Mạng lưới kho bãi:** 4 Tổng kho trung chuyển đang duy trì công suất vận hành an toàn.\n` +
      `• **Sự cố:** Không ghi nhận sự cố vận tải nghiêm trọng nào.\n\n` +
      `💡 *Gợi ý:* Bạn có thể hỏi tôi về hướng dẫn tạo đơn hàng, cách thức điều phối xe thông minh, tối ưu tuyến đường 2-Opt, kiểm tra công suất kho hoặc tra cứu mã vận đơn bất kỳ lúc nào!`,
    insights: {
      type: 'SLA_ALERT',
      title: 'Tóm Tắt Vận Hành VietRoute TMS & WMS',
      description: 'Tổng hợp số liệu thời gian thực từ các phân hệ vận hành.',
      metrics: [
        { label: 'Tổng đơn hàng', value: '120 đơn', positive: true },
        { label: 'Đang vận chuyển', value: '24 đơn', positive: true },
        { label: 'Tài xế sẵn sàng', value: '5 người', positive: true },
      ],
      actionLabel: 'Xem Báo Cáo & Phân Tích',
      actionUrl: '/reports',
    },
  };
}
