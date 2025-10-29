import type { SupportedLanguage } from '@/constants/localization';

export type TranslationTree = {
  tabs: {
    home: string;
    walk: string;
    activity: string;
    settings: string;
  };
  common: {
    confirm: string;
    cancel: string;
    backButton: string;
    homeButton: string;
    share: string;
    shareInProgress: string;
    delete: string;
    deleteAction: string;
    deleteInProgress: string;
    shareDialogTitle: string;
    missingImageTitle: string;
    missingImageMessage: string;
    shareUnavailableTitle: string;
    shareUnavailableMessage: string;
    shareFailedTitle: string;
    shareFailedMessage: string;
    deleteFailedTitle: string;
    deleteFailedMessage: string;
    walkTimeLabel: string;
    walkDistanceLabel: string;
    timeLabel: string;
    memoLabel: string;
  };
  home: {
    greeting: string;
    title: string;
    summaryTitle: string;
    startTip: string;
    historyButton: string;
    memoTitle: string;
  };
  walk: {
    heroTitle: string;
    heroSubtitle: string;
    startButton: string;
    recentTitle: string;
    placeholderTitle: string;
    placeholderSubtitle: string;
  };
  activity: {
    emptyTitle: string;
    emptySubtitle: string;
    deleteTitle: string;
    deleteMessage: string;
    swipeDelete: string;
  };
  activityDetail: {
    invalidRouteMessage: string;
    missingMessage: string;
    screenTitle: string;
    snapshotMissingTitle: string;
    snapshotMissingSubtitle: string;
    memoLabel: string;
  };
  summary: {
    alertCompleteTitle: string;
    alertCompleteMessage: string;
    heroTitle: string;
    heroSubtitle: string;
    snapshotMissingTitle: string;
    snapshotMissingSubtitle: string;
    shareButton: string;
    shareInProgress: string;
    memoLabel: string;
    memoPlaceholder: string;
    saveButton: string;
    saveInProgress: string;
    loadErrorMessage: string;
  };
  walkSession: {
    locationPermissionTitle: string;
    locationPermissionMessage: string;
    loadingPosition: string;
    stopButton: string;
    stopInProgress: string;
    weakGpsSignal: string;
  };
  settings: {
    title: string;
    description: string;
    languageSectionTitle: string;
    languageSectionSubtitle: string;
    deviceLanguageLabel: (device: string) => string;
    languageOptions: Record<SupportedLanguage, string>;
  };
};

const ko: TranslationTree = {
  tabs: {
    home: '홈',
    walk: '산책',
    activity: '기록',
    settings: '설정',
  },
  common: {
    confirm: '확인',
    cancel: '취소',
    backButton: '돌아가기',
    homeButton: '홈으로 돌아가기',
    share: '공유하기',
    shareInProgress: '공유 준비 중...',
    delete: '삭제',
    deleteAction: '삭제하기',
    deleteInProgress: '삭제 중...',
    shareDialogTitle: '산책 공유하기',
    missingImageTitle: '이미지가 없어요',
    missingImageMessage: '지도 스냅샷을 찾지 못해서 공유할 수 없어요.',
    shareUnavailableTitle: '공유를 지원하지 않아요',
    shareUnavailableMessage: '이 기기에서는 공유 기능을 사용할 수 없어요.',
    shareFailedTitle: '공유 실패',
    shareFailedMessage: '공유 중 작은 문제가 있었어요. 조금 있다가 다시 시도해 주세요.',
    deleteFailedTitle: '삭제 실패',
    deleteFailedMessage: '산책 기록을 삭제하는 중 문제가 생겼어요. 다시 시도해 주세요.',
    walkTimeLabel: '산책 시간',
    walkDistanceLabel: '이동 거리',
    timeLabel: '시간',
    memoLabel: '메모',
  },
  home: {
    greeting: '오늘도 산책 나가기 딱 좋은 날이에요',
    title: '댕댕이와 같이 걸어볼까요?',
    summaryTitle: '오늘의 기록',
    startTip: '산책 탭의 시작 버튼을 누르면 기록이 시작돼요.',
    historyButton: '지난 산책 살펴보기',
    memoTitle: '최근 메모',
  },
  walk: {
    heroTitle: '🐾',
    heroSubtitle: '댕댕이가 산책을 가고 싶어해요!',
    startButton: '시작',
    recentTitle: '마지막 산책',
    placeholderTitle: '첫 산책을 시작해보세요',
    placeholderSubtitle: '시작하기 버튼을 누르면 산책 기록이 차곡차곡 쌓여요.',
  },
  activity: {
    emptyTitle: '아직 기록이 없어요',
    emptySubtitle: '첫 산책을 기록하면 여기에서 바로 확인할 수 있어요.',
    deleteTitle: '산책 삭제',
    deleteMessage: '이 산책 기록을 지울까요?',
    swipeDelete: '삭제',
  },
  activityDetail: {
    invalidRouteMessage: '잘못된 경로로 들어왔어요.',
    missingMessage: '산책 기록을 찾지 못했어요.',
    screenTitle: '산책 기록',
    snapshotMissingTitle: '지도 이미지를 찾을 수 없어요',
    snapshotMissingSubtitle: '이 산책에는 저장된 지도 스냅샷이 없어요.',
    memoLabel: '메모',
  },
  summary: {
    alertCompleteTitle: '산책 완료!',
    alertCompleteMessage: '기록이 저장되었어요.',
    heroTitle: '산책 완료!',
    heroSubtitle: '친구들에게 기록을 공유해봐요! 🐾',
    snapshotMissingTitle: '지도 이미지를 만들지 못했어요',
    snapshotMissingSubtitle: '네트워크나 권한 문제로 스냅샷을 만들지 못했을 수 있어요.',
    shareButton: '산책 공유하기',
    shareInProgress: '공유 준비 중...',
    memoLabel: '메모 (선택)',
    memoPlaceholder: '산책 중 느낀 작은 순간들을 살짝 남겨보세요.',
    saveButton: '기록 저장하기',
    saveInProgress: '저장 중...',
    loadErrorMessage: '요약 정보를 불러오지 못했어요.',
  },
  walkSession: {
    locationPermissionTitle: '위치 권한 필요',
    locationPermissionMessage: '산책을 기록하려면 위치 접근 허용이 필요해요.',
    loadingPosition: '위치 정보를 불러오는 중이에요...',
    stopButton: '산책 종료',
    stopInProgress: '처리 중...',
    weakGpsSignal: 'GPS 신호가 약합니다',
  },
  settings: {
    title: '앱 설정',
    description: '기본적으로 기기 언어를 따라가요. 원하시면 아래에서 바꿔주세요.',
    languageSectionTitle: '산책 언어',
    languageSectionSubtitle: '언어를 바꾸면 앱이 바로 바뀝니다.',
    deviceLanguageLabel: (device) => `현재 기기 언어: ${device}`,
    languageOptions: {
      ko: '한국어',
      en: 'English',
      ja: '日本語',
    },
  },
};

const en: TranslationTree = {
  tabs: {
    home: 'Home',
    walk: 'Walk',
    activity: 'Log',
    settings: 'Settings',
  },
  common: {
    confirm: 'OK',
    cancel: 'Cancel',
    backButton: 'Go back',
    homeButton: 'Back to home',
    share: 'Share',
    shareInProgress: 'Preparing share...',
    delete: 'Delete',
    deleteAction: 'Delete',
    deleteInProgress: 'Deleting...',
    shareDialogTitle: 'Share walk',
    missingImageTitle: 'No image found',
    missingImageMessage: 'We could not find a map snapshot to share.',
    shareUnavailableTitle: 'Sharing unavailable',
    shareUnavailableMessage: 'This device does not support sharing.',
    shareFailedTitle: 'Share failed',
    shareFailedMessage: 'Something went wrong. Please try again soon.',
    deleteFailedTitle: 'Delete failed',
    deleteFailedMessage: 'We could not delete the walk. Please try again.',
    walkTimeLabel: 'Walk time',
    walkDistanceLabel: 'Distance',
    timeLabel: 'Time',
    memoLabel: 'Memo',
  },
  home: {
    greeting: 'Another perfect day for a walk.',
    title: 'Shall we walk with your pup?',
    summaryTitle: 'Today’s log',
    startTip: 'Open the walk tab and tap start to begin tracking.',
    historyButton: 'View past walks',
    memoTitle: 'Latest memo',
  },
  walk: {
    heroTitle: '🐾',
    heroSubtitle: 'Your pup can’t wait to head out!',
    startButton: 'Start',
    recentTitle: 'Latest walk',
    placeholderTitle: 'Start your first walk',
    placeholderSubtitle: 'Tap start to build up your walk log.',
  },
  activity: {
    emptyTitle: 'No walks yet',
    emptySubtitle: 'Log your first walk and it will appear here.',
    deleteTitle: 'Delete walk',
    deleteMessage: 'Delete this walk record?',
    swipeDelete: 'Delete',
  },
  activityDetail: {
    invalidRouteMessage: 'This route looks incorrect.',
    missingMessage: 'We could not find that walk record.',
    screenTitle: 'Walk record',
    snapshotMissingTitle: 'Map image not found',
    snapshotMissingSubtitle: 'There is no saved map snapshot for this walk.',
    memoLabel: 'Memo',
  },
  summary: {
    alertCompleteTitle: 'Walk complete!',
    alertCompleteMessage: 'Your record is saved.',
    heroTitle: 'Walk complete!',
    heroSubtitle: 'Share your walk with friends! 🐾',
    snapshotMissingTitle: 'Could not create the map image',
    snapshotMissingSubtitle: 'A network or permission issue may have blocked the snapshot.',
    shareButton: 'Share walk',
    shareInProgress: 'Preparing share...',
    memoLabel: 'Memo (optional)',
    memoPlaceholder: 'Leave a note about the walk.',
    saveButton: 'Save walk',
    saveInProgress: 'Saving...',
    loadErrorMessage: 'We could not load the summary.',
  },
  walkSession: {
    locationPermissionTitle: 'Location needed',
    locationPermissionMessage: 'Allow location access to record the walk.',
    loadingPosition: 'Loading your location...',
    stopButton: 'Finish walk',
    stopInProgress: 'Working...',
    weakGpsSignal: 'Weak GPS signal',
  },
  settings: {
    title: 'App settings',
    description: 'We follow your device language by default. Change it below if you like.',
    languageSectionTitle: 'Walk language',
    languageSectionSubtitle: 'Changes take effect right away.',
    deviceLanguageLabel: (device) => `Device language: ${device}`,
    languageOptions: {
      ko: '한국어',
      en: 'English',
      ja: '日本語',
    },
  },
};

const ja: TranslationTree = {
  tabs: {
    home: 'ホーム',
    walk: 'おさんぽ',
    activity: 'きろく',
    settings: '設定',
  },
  common: {
    confirm: 'OK',
    cancel: 'キャンセル',
    backButton: 'もどる',
    homeButton: 'ホームへもどる',
    share: 'シェア',
    shareInProgress: 'シェアを準備中...',
    delete: '削除',
    deleteAction: '削除',
    deleteInProgress: '削除しています...',
    shareDialogTitle: 'おさんぽをシェア',
    missingImageTitle: '画像が見つかりません',
    missingImageMessage: 'シェアできる地図スナップが見つかりませんでした。',
    shareUnavailableTitle: 'シェアできません',
    shareUnavailableMessage: 'この端末ではシェア機能が使えません。',
    shareFailedTitle: 'シェアに失敗しました',
    shareFailedMessage: '少し時間を置いてからもう一度お試しください。',
    deleteFailedTitle: '削除に失敗しました',
    deleteFailedMessage: 'おさんぽ記録を削除できませんでした。もう一度お試しください。',
    walkTimeLabel: 'おさんぽ時間',
    walkDistanceLabel: 'きょり',
    timeLabel: '時間',
    memoLabel: 'メモ',
  },
  home: {
    greeting: 'きょうもおさんぽ日和だよ。',
    title: 'わんちゃんといっしょに歩こっか？',
    summaryTitle: 'きょうのきろく',
    startTip: 'おさんぽタブのスタートを押すと記録がはじまるよ。',
    historyButton: 'これまでのおさんぽを見る',
    memoTitle: 'さいきんのメモ',
  },
  walk: {
    heroTitle: '🐾',
    heroSubtitle: 'わんちゃんがおさんぽに行きたがってるよ！',
    startButton: 'スタート',
    recentTitle: 'さいきんのおさんぽ',
    placeholderTitle: 'はじめてのおさんぽを記録しよう',
    placeholderSubtitle: 'スタートを押すとおさんぽ記録がたまっていくよ。',
  },
  activity: {
    emptyTitle: 'まだ記録がありません',
    emptySubtitle: 'はじめてのおさんぽを記録するとここに表示されます。',
    deleteTitle: '記録を削除',
    deleteMessage: 'このおさんぽ記録を削除しますか？',
    swipeDelete: '削除',
  },
  activityDetail: {
    invalidRouteMessage: 'まちがったルートから来たみたい。',
    missingMessage: 'そのおさんぽ記録は見つかりませんでした。',
    screenTitle: 'おさんぽ記録',
    snapshotMissingTitle: '地図の画像が見つかりません',
    snapshotMissingSubtitle: 'この記録には地図スナップが保存されていません。',
    memoLabel: 'メモ',
  },
  summary: {
    alertCompleteTitle: 'おさんぽ完了！',
    alertCompleteMessage: '記録を保存したよ。',
    heroTitle: 'おさんぽ完了！',
    heroSubtitle: 'お友だちに記録をシェアしてね！🐾',
    snapshotMissingTitle: '地図の画像を作れませんでした',
    snapshotMissingSubtitle: '通信や権限の問題でスナップが作成できなかったみたい。',
    shareButton: 'おさんぽをシェア',
    shareInProgress: 'シェアを準備中...',
    memoLabel: 'メモ (にんい)',
    memoPlaceholder: 'おさんぽで感じたことをメモしてね。',
    saveButton: '記録を保存',
    saveInProgress: '保存しています...',
    loadErrorMessage: 'サマリーを読み込めませんでした。',
  },
  walkSession: {
    locationPermissionTitle: '位置情報が必要です',
    locationPermissionMessage: 'おさんぽを記録するには位置情報の許可が必要です。',
    loadingPosition: '位置情報を読み込み中...',
    stopButton: 'おさんぽ終了',
    stopInProgress: '処理しています...',
    weakGpsSignal: 'GPS信号が弱いです',
  },
  settings: {
    title: 'アプリ設定',
    description: '既定では端末の言語を使います。必要ならここで変えてね。',
    languageSectionTitle: 'おさんぽの言語',
    languageSectionSubtitle: '選ぶとすぐに切り替わります。',
    deviceLanguageLabel: (device) => `端末の言語: ${device}`,
    languageOptions: {
      ko: '한국어',
      en: 'English',
      ja: '日本語',
    },
  },
};

export const translations: Record<SupportedLanguage, TranslationTree> = {
  ko,
  en,
  ja,
};
