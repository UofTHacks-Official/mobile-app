#import "NotificationService.h"

@interface NotificationService ()

@property (nonatomic, strong) void (^contentHandler)(UNNotificationContent *contentToDeliver);
@property (nonatomic, strong) UNMutableNotificationContent *bestAttemptContent;

@end

@implementation NotificationService

- (void)didReceiveNotificationRequest:(UNNotificationRequest *)request withContentHandler:(void (^)(UNNotificationContent * _Nonnull))contentHandler {
    self.contentHandler = contentHandler;
    self.bestAttemptContent = [request.content mutableCopy];

    // Get the image URL from the notification payload
    NSDictionary *userInfo = request.content.userInfo;
    NSString *imageURLString = userInfo[@"richContent"][@"image"];

    if (imageURLString) {
        NSURL *imageURL = [NSURL URLWithString:imageURLString];

        NSURLSession *session = [NSURLSession sharedSession];
        [[session downloadTaskWithURL:imageURL completionHandler:^(NSURL *location, NSURLResponse *response, NSError *error) {
            if (!error && location) {
                NSString *tempPath = [NSTemporaryDirectory() stringByAppendingPathComponent:imageURL.lastPathComponent];
                NSURL *tempURL = [NSURL fileURLWithPath:tempPath];

                [[NSFileManager defaultManager] removeItemAtURL:tempURL error:nil];
                [[NSFileManager defaultManager] moveItemAtURL:location toURL:tempURL error:nil];

                NSError *attachmentError = nil;
                UNNotificationAttachment *attachment = [UNNotificationAttachment attachmentWithIdentifier:@"image"
                                                                                                      URL:tempURL
                                                                                                  options:nil
                                                                                                    error:&attachmentError];

                if (attachment && !attachmentError) {
                    self.bestAttemptContent.attachments = @[attachment];
                }
            }

            // Deliver the notification
            self.contentHandler(self.bestAttemptContent);
        }] resume];
    } else {
        // No image URL, deliver notification as-is
        self.contentHandler(self.bestAttemptContent);
    }
}

- (void)serviceExtensionTimeWillExpire {
    // Called just before the extension will be terminated by the system.
    // Use this as an opportunity to deliver your "best attempt" at modified content, otherwise the original push payload will be used.
    self.contentHandler(self.bestAttemptContent);
}

@end
