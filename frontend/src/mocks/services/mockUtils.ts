/**
 * Tiện ích giả lập độ trễ mạng và lỗi API cho Mock Services
 */

export interface MockServiceOptions {
  /** Cố tình tạo lỗi giả lập để kiểm thử UI Error Boundary / Toast / Retry */
  simulateError?: boolean;
  /** Độ trễ mạng chỉ định (nếu không truyền sẽ sinh ngẫu nhiên từ 300ms đến 600ms) */
  delayMs?: number;
}

/**
 * Mô phỏng độ trễ mạng thực tế từ 300ms - 600ms và cơ chế ném lỗi giả lập
 */
export async function simulateLatency(options?: MockServiceOptions): Promise<void> {
  const waitTime = options?.delayMs ?? Math.floor(Math.random() * 300) + 300;
  await new Promise((resolve) => setTimeout(resolve, waitTime));

  if (options?.simulateError) {
    throw new Error("Lỗi giả lập từ Mock Service: Máy chủ VietRoute từ chối yêu cầu (500)");
  }
}
