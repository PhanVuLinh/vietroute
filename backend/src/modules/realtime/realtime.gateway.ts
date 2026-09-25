import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface VehicleTelemetryPayload {
  vehicleId: string;
  plateNumber?: string;
  driverId?: string;
  driverName?: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  fuelLevel?: number;
  batteryLevel?: number;
  engineStatus: 'RUNNING' | 'IDLE' | 'STOPPED';
  timestamp: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger('RealtimeGateway');
  private connectedClientsCount = 0;

  constructor(private readonly jwtService: JwtService) {}

  afterInit(server: Server) {
    this.logger.log('🚀 WebSocket Gateway initialized on port 3001');
  }

  async handleConnection(client: Socket) {
    this.connectedClientsCount++;
    const authHeader =
      client.handshake.auth?.token ||
      client.handshake.headers?.authorization ||
      client.handshake.query?.token;

    let user: any = null;
    if (authHeader) {
      try {
        const token = (authHeader as string).replace('Bearer ', '');
        user = this.jwtService.verify(token);
        client.data.user = user;
        
        // Gia nhập các room phân quyền
        client.join(`user:${user.sub}`);
        if (['ADMIN', 'MANAGER', 'DISPATCHER'].includes(user.role)) {
          client.join('role:staff');
          client.join('incidents:feed');
        }
      } catch (err) {
        // Token không hợp lệ hoặc hết hạn, cho phép kết nối ở chế độ Guest tracking
        this.logger.debug(`Client ${client.id} connected as Guest/Unverified: ${(err as any)?.message}`);
      }
    }

    // Mặc định mọi client đều nhận luồng telemetry xe
    client.join('tracking:fleet');

    this.logger.log(
      `⚡ Client connected: ${client.id} | User: ${user?.email || 'Public'} | Total: ${this.connectedClientsCount}`,
    );

    // Gửi tín hiệu chào mừng & xác nhận kết nối thành công
    client.emit('connection:ack', {
      status: 'CONNECTED',
      serverTime: new Date().toISOString(),
      clientId: client.id,
      authenticated: !!user,
      user: user ? { email: user.email, role: user.role } : null,
    });
  }

  handleDisconnect(client: Socket) {
    this.connectedClientsCount = Math.max(0, this.connectedClientsCount - 1);
    this.logger.log(
      `🔌 Client disconnected: ${client.id} | Remaining: ${this.connectedClientsCount}`,
    );
  }

  getConnectedCount(): number {
    return this.connectedClientsCount;
  }

  // ==========================================
  // EVENT BROADCAST METHODS (Gọi từ các Service)
  // ==========================================

  /**
   * Phát sóng cập nhật vị trí GPS thời gian thực của xe
   */
  emitTelemetryUpdate(telemetry: VehicleTelemetryPayload) {
    if (!this.server) return;
    this.server.to('tracking:fleet').emit('telemetry:update', telemetry);
  }

  /**
   * Phát sóng khi trạng thái đơn hàng thay đổi
   */
  emitOrderStatusChanged(payload: {
    orderId: string;
    orderCode: string;
    status: string;
    updatedAt: string;
    message?: string;
  }) {
    if (!this.server) return;
    this.server.emit('order:status_changed', payload);
  }

  /**
   * Phát sóng sự cố khẩn cấp tới Điều phối & Quản lý
   */
  emitIncidentCreated(incident: {
    id: string;
    incidentCode: string;
    title: string;
    severity: string;
    type: string;
    createdAt: string;
    driverName?: string;
  }) {
    if (!this.server) return;
    // Bắn cả 2 sự kiện: incident:created và alert:emergency
    this.server.to('incidents:feed').emit('incident:created', incident);
    this.server.emit('alert:emergency', {
      id: incident.id,
      title: `[SỰ CỐ ${incident.severity}] ${incident.title}`,
      message: `Mã: ${incident.incidentCode} - Loại: ${incident.type}`,
      severity: incident.severity === 'CRITICAL' || incident.severity === 'HIGH' ? 'HIGH' : 'MEDIUM',
    });
  }

  /**
   * Phát sóng khi tài xế nộp tiền COD
   */
  emitCodSubmitted(codSession: {
    id?: string;
    reconciliationId?: string;
    reconciliationCode?: string;
    driverName?: string;
    driverId?: string;
    submittedAmount?: number;
    amount?: number;
    discrepancy?: number;
    status?: string;
    orderCode?: string;
    message?: string;
  }) {
    if (!this.server) return;
    this.server.to('role:staff').emit('cod:submitted', codSession);
  }

  /**
   * Phát sóng sự kiện hóa đơn B2B đã được thanh toán qua VietQR
   */
  emitInvoicePaid(invoice: {
    id: string;
    invoiceCode: string;
    customerName: string;
    totalAmount: number;
    paidAmount: number;
    status: string;
  }) {
    if (!this.server) return;
    this.server.emit('invoice:paid', invoice);
  }

  /**
   * Phát sóng sự kiện gửi thông báo nhắc nợ tự động hàng loạt
   */
  emitDebtRemindersSent(summary: {
    count: number;
    totalOverdueAmount: number;
    timestamp: string;
  }) {
    if (!this.server) return;
    this.server.emit('finance:debt_reminders_sent', summary);
  }

  /**
   * Gửi thông báo trực tiếp đến 1 User cụ thể
   */
  emitUserNotification(userId: string, notification: any) {
    if (!this.server) return;
    this.server.to(`user:${userId}`).emit('notification:new', notification);
  }

  /**
   * Phát sóng cảnh báo chung toàn hệ thống
   */
  broadcastAlert(alert: {
    id: string;
    title: string;
    message: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
  }) {
    if (!this.server) return;
    this.server.emit('alert:emergency', alert);
  }

  /**
   * Phát sóng sự kiện quét mã vạch bốc xếp hàng xuất kho (WMS Dock Scan)
   */
  emitWmsDockScanned(payload: {
    warehouseId: string;
    dispatchCode: string;
    barcode: string;
    success: boolean;
    itemName?: string;
    scannedCount: number;
    totalCount: number;
    isComplete: boolean;
    scannedBy?: string;
    timestamp: string;
  }) {
    if (!this.server) return;
    this.server.emit('wms:dock_scanned', payload);
  }

  /**
   * Phát sóng sự kiện quét nhập kho vào phân khu (WMS Inbound Scan)
   */
  emitWmsInboundScanned(payload: {
    warehouseId: string;
    barcode: string;
    sku: string;
    productName: string;
    zoneCode: string;
    quantity: number;
    newTotalQuantity: number;
    scannedBy?: string;
    timestamp: string;
  }) {
    if (!this.server) return;
    this.server.emit('wms:inbound_scanned', payload);
  }

  // ==========================================
  // CLIENT LISTENERS (Client gửi lên Server)
  // ==========================================

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket): string {
    return 'pong';
  }

  @SubscribeMessage('tracking:subscribe_vehicle')
  handleSubscribeVehicle(
    @ConnectedSocket() client: Socket,
    @MessageBody() vehicleId: string,
  ) {
    client.join(`vehicle:${vehicleId}`);
    return { subscribed: vehicleId };
  }
}
