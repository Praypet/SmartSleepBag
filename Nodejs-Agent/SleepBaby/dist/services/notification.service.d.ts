export declare class NotificationService {
    constructor();
    sendPushNotification(userId: string, title: string, body: string): Promise<void>;
    sendEmailNotification(userId: string, subject: string, body: string): Promise<void>;
}
export declare const notificationService: NotificationService;
//# sourceMappingURL=notification.service.d.ts.map