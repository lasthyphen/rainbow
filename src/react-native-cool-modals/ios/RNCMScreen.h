#import <React/RCTViewManager.h>
#import <React/RCTView.h>
#import <React/RCTComponent.h>

@class RNSScreenContainerView;

typedef NS_ENUM(NSInteger, RNSScreenStackPresentation) {
  RNSScreenStackPresentationPush,
  RNSScreenStackPresentationModal,
  RNSScreenStackPresentationTransparentModal,
  RNSScreenStackPresentationContainedModal,
  RNSScreenStackPresentationContainedTransparentModal,
  RNSScreenStackPresentationFullScreenModal,
  RNSScreenStackPresentationFormSheet
};

typedef NS_ENUM(NSInteger, RNSScreenStackAnimation) {
  RNSScreenStackAnimationDefault,
  RNSScreenStackAnimationNone,
  RNSScreenStackAnimationFade,
  RNSScreenStackAnimationFlip,
};

@interface RCTConvert (RNSScreen)

+ (RNSScreenStackPresentation)RNSScreenStackPresentation:(id _Nullable )json;
+ (RNSScreenStackAnimation)RNSScreenStackAnimation:(id _Nullable )json;

@end

@interface RNCMScreen : UIViewController

@property (nonatomic, strong) id<UIViewControllerTransitioningDelegate> _Nonnull transDelegate;
- (instancetype _Nullable )initWithView:(UIView *_Nullable)view;
- (void)notifyFinishTransitioning;
- (UIViewController*_Nullable) parentVC;

@end

@interface RNCMScreenManager : RCTViewManager<RCTBridgeModule>
@end

@interface RNCMScreenView : RCTView

@property (nonatomic, copy) RCTDirectEventBlock _Nullable onAppear;
@property (nonatomic, copy) RCTDirectEventBlock _Nonnull onDismissed;
@property (nonatomic, copy) RCTDirectEventBlock _Nullable onWillDismiss;
@property (nonatomic, copy) RCTDirectEventBlock _Nullable onTouchTop;
@property (weak, nonatomic) UIView * _Nullable reactSuperview;
@property (nonatomic, retain) UIViewController * _Nullable controller;
@property (nonatomic, readonly) BOOL dismissed;
@property (nonatomic) BOOL active;
@property (nonatomic) BOOL customStack;
@property (nonatomic) BOOL gestureEnabled;
@property (nonatomic) BOOL dismissable;
@property (nonatomic) BOOL showDragIndicator;
@property (nonatomic) BOOL ignoreBottomOffset;
@property (nonatomic) BOOL interactWithScrollView;
@property (nonatomic) NSNumber* _Nullable topOffset;
@property (nonatomic) NSNumber* _Nullable cornerRadius;
@property (nonatomic) RNSScreenStackAnimation stackAnimation;
@property (nonatomic) RNSScreenStackPresentation stackPresentation;


@property (nonatomic) BOOL isShortFormEnabled;
@property (nonatomic, nonnull) NSNumber *longFormHeight;
@property (nonatomic, nonnull) NSNumber *springDamping;
@property (nonatomic, nonnull) NSNumber *transitionDuration;
@property (nonatomic, nonnull) UIColor *modalBackgroundColor;
@property (nonatomic, nonnull) NSNumber *backgroundOpacity;
@property (nonatomic) BOOL anchorModalToLongForm;
@property (nonatomic) BOOL allowsDragToDismiss;
@property (nonatomic) BOOL allowsTapToDismiss;
@property (nonatomic) BOOL blocksBackgroundTouches;
@property (nonatomic, nonnull) NSNumber *headerHeight;
@property (nonatomic, nonnull) NSNumber *shortFormHeight;
@property (nonatomic) BOOL startFromShortForm;

- (void)notifyFinishTransitioning;
- (void)willDismiss;
- (void)notifyAppear;
- (void)removeController;
@end

@interface UIView (RNSScreen)
- (UIViewController *_Nonnull)parentViewController;
@end
