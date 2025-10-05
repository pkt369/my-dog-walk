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
    title: '댕댕이랑 살랑살랑 걸어볼까요?',
    summaryTitle: '오늘의 따끈따끈 기록',
    startTip: '산책 탭의 시작 버튼을 누르면 기록이 똑 하고 시작돼요.',
    historyButton: '지난 산책 살펴보기',
    memoTitle: '최근 메모',
  },
  walk: {
    heroTitle: '준비 완료! 산책 모험 떠나볼까요?',
    heroSubtitle: '친구들에게 기록을 공유해봐요! 🐾',
    startButton: '시작하기',
    recentTitle: '마지막 산책',
    placeholderTitle: '첫 산책을 시작해보세요',
    placeholderSubtitle: '시작하기 버튼을 누르면 산책 이야기가 차곡차곡 쌓여요.',
  },
  activity: {
    emptyTitle: '아직 기록이 없어요',
    emptySubtitle: '첫 산책을 기록하면 여기에서 바로 확인할 수 있어요.',
    deleteTitle: '산책 삭제',
    deleteMessage: '이 산책 기록을 살짝 지울까요?',
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
    activity: 'Logbook',
    settings: 'Settings',
  },
  common: {
    confirm: 'Okay',
    cancel: 'Cancel',
    backButton: 'Go back',
    homeButton: 'Back to home',
    share: 'Share walk',
    shareInProgress: 'Getting share ready...',
    delete: 'Delete',
    deleteAction: 'Delete walk',
    deleteInProgress: 'Deleting...',
    shareDialogTitle: 'Share the walk',
    missingImageTitle: 'No image found',
    missingImageMessage: 'We could not find a map snapshot to share.',
    shareUnavailableTitle: 'Sharing unavailable',
   shareUnavailableMessage: 'This device does not support sharing.',
    shareFailedTitle: 'Share failed',
    shareFailedMessage: 'Something got in the way. Please try again in a moment.',
    deleteFailedTitle: 'Delete failed',
    deleteFailedMessage: 'Something went wrong removing the walk. Please try again.',
    walkTimeLabel: 'Walk time',
    walkDistanceLabel: 'Distance',
    timeLabel: 'Time',
    memoLabel: 'Notes',
  },
  home: {
    greeting: 'Another lovely day for a stroll!',
    title: "Ready for a sweet walk with your pup?",
    summaryTitle: 'Today’s walk stats',
    startTip: 'Tap the walk tab and start button to begin a new adventure.',
    historyButton: 'Browse past walks',
    memoTitle: 'Latest memo',
  },
  walk: {
    heroTitle: 'All set for a waggy walk?',
    heroSubtitle: 'Share your walk with friends! 🐾',
    startButton: 'Start walk',
    recentTitle: 'Latest walk',
    placeholderTitle: 'Start your first walk',
    placeholderSubtitle: 'Hit the start button and your walk stories will bloom here.',
  },
  activity: {
    emptyTitle: 'No walks yet',
    emptySubtitle: 'Once you log a walk, your history will appear here.',
    deleteTitle: 'Delete walk',
    deleteMessage: 'Would you like to gently remove this walk?',
    swipeDelete: 'Delete',
  },
  activityDetail: {
    invalidRouteMessage: 'This path seems to be wrong.',
    missingMessage: 'We could not find that walk record.',
    screenTitle: 'Walk entry',
    snapshotMissingTitle: 'Map snapshot missing',
    snapshotMissingSubtitle: 'No stored map snapshot for this walk.',
    memoLabel: 'Memo',
  },
  summary: {
    alertCompleteTitle: 'Walk complete!',
    alertCompleteMessage: 'Your record is saved.',
    heroTitle: 'Walk complete!',
    heroSubtitle: 'Your pup is wagging with joy 🐾',
    snapshotMissingTitle: 'Couldn’t create the map image',
    snapshotMissingSubtitle: 'A network or permission hiccup may have stopped the snapshot.',
    shareButton: 'Share this walk',
    shareInProgress: 'Getting share ready...',
    memoLabel: 'Memo (optional)',
    memoPlaceholder: 'Jot down sweet moments from the walk.',
    saveButton: 'Save walk log',
    saveInProgress: 'Saving...',
    loadErrorMessage: 'We could not load the summary.',
  },
  walkSession: {
    locationPermissionTitle: 'Location needed',
    locationPermissionMessage: 'We need location access to record the walk.',
    loadingPosition: 'Fetching your location...',
    stopButton: 'Finish walk',
    stopInProgress: 'Working...',
  },
  settings: {
    title: 'App settings',
    description: 'We follow your device language by default. Pick another if you prefer.',
    languageSectionTitle: 'Walk language',
    languageSectionSubtitle: 'Changes apply right away.',
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
    activity: 'きろく帳',
    settings: '設定',
  },
  common: {
    confirm: 'OK',
    cancel: 'キャンセル',
    backButton: 'もどる',
    homeButton: 'ホームへもどる',
    share: 'おさんぽをシェア',
    shareInProgress: 'シェアを準備中...',
    delete: '削除',
    deleteAction: '記録を削除',
    deleteInProgress: '削除しています...',
    shareDialogTitle: 'おさんぽをシェア',
    missingImageTitle: '画像が見つかりません',
    missingImageMessage: 'シェアできる地図スナップが見つかりませんでした。',
    shareUnavailableTitle: 'シェアできません',
    shareUnavailableMessage: 'この端末ではシェア機能が使えません。',
    shareFailedTitle: 'シェアに失敗しました',
    shareFailedMessage: 'うまくできませんでした。少ししてからもう一度お試しください。',
    deleteFailedTitle: '削除に失敗しました',
    deleteFailedMessage: 'おさんぽ記録を消すときに問題が起きました。もう一度お試しください。',
    walkTimeLabel: 'おさんぽ時間',
    walkDistanceLabel: 'きょり',
    timeLabel: '時間',
    memoLabel: 'メモ',
  },
  home: {
    greeting: 'きょうもおさんぽびよりだよ',
    title: 'わんちゃんとるんるん歩きにいこう！',
    summaryTitle: 'きょうの記録',
    startTip: 'おさんぽタブのスタートを押すと記録がはじまるよ。',
    historyButton: 'これまでのおさんぽ',
    memoTitle: 'さいきんのメモ',
  },
  walk: {
    heroTitle: 'わくわく準備はできた？',
    heroSubtitle: 'お友だちに記録をシェアしてね！🐾',
    startButton: 'スタート',
    recentTitle: 'さいきんのおさんぽ',
    placeholderTitle: 'はじめてのおさんぽを記録しよう',
    placeholderSubtitle: 'スタートを押すとおさんぽストーリーがここにたまるよ。',
  },
  activity: {
    emptyTitle: 'まだ記録がありません',
    emptySubtitle: 'はじめてのおさんぽを記録するとここで見られるよ。',
    deleteTitle: '記録を削除',
    deleteMessage: 'このおさんぽ記録をそっと消しますか？',
    swipeDelete: '削除',
  },
  activityDetail: {
    invalidRouteMessage: 'まちがったルートから来たみたい。',
    missingMessage: 'そのおさんぽ記録は見つかりませんでした。',
    screenTitle: 'おさんぽ記録',
    snapshotMissingTitle: '地図の画像がありません',
    snapshotMissingSubtitle: 'この記録には地図スナップが保存されていません。',
    memoLabel: 'メモ',
  },
  summary: {
    alertCompleteTitle: 'おさんぽ完了！',
    alertCompleteMessage: '記録を保存したよ。',
    heroTitle: 'おさんぽ完了！',
    heroSubtitle: 'わんちゃんがしっぽをぶんぶんふってるよ 🐾',
    snapshotMissingTitle: '地図の画像を作れませんでした',
    snapshotMissingSubtitle: '通信や権限の問題でスナップを作れなかったみたい。',
    shareButton: 'おさんぽをシェア',
    shareInProgress: 'シェアを準備中...',
    memoLabel: 'メモ (にんい)',
    memoPlaceholder: 'おさんぽで感じたほっこりをメモしてね。',
    saveButton: '記録を保存',
    saveInProgress: '保存しています...',
    loadErrorMessage: 'サマリーを読み込めませんでした。',
  },
  walkSession: {
    locationPermissionTitle: '位置情報が必要です',
    locationPermissionMessage: 'おさんぽを記録するには位置情報の許可が必要です。',
    loadingPosition: '位置情報をよみこみ中...',
    stopButton: 'おさんぽ終了',
    stopInProgress: '処理しています...',
  },
  settings: {
    title: 'アプリ設定',
    description: '基本は端末のことばを使います。お好みでえらびなおしてください。',
    languageSectionTitle: 'おさんぽの言語',
    languageSectionSubtitle: '選ぶとすぐに切りかわります。',
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
