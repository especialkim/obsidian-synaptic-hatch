import { moment } from 'obsidian';

export type Language = 'ko' | 'en';

// 모든 번역 메시지 정의
export const TRANSLATIONS: Record<Language, Record<string, string>> = {
	ko: {
		// 탭 메뉴
		'menu.openInNewPinnedWindow': '새 고정 창에서 열기',
		'menu.openInNewPinnedWindowExclusive': '새 고정 창에서 열기 (단독)',

		// 명령어
		'command.openAlwaysOnTopPopout': '현재 파일을 새 고정 창에서 열기',
		'command.openAlwaysOnTopPopoutExclusive': '현재 파일을 새 고정 창에서 열기 (단독)',
		'command.openCustomPopout': '커스텀 팝업 열기',
		'command.toggleWindowPin': '창 고정 토글',

		// 설정
		'setting.title': '항상 위 설정',
		'setting.showIndicatorInMainWindow': '메인 창에 표시기 표시',
		'setting.showIndicatorInPopoutWindows': '팝업 창에 표시기 표시',
		'setting.indicator': '표시기 설정',
		'setting.mainWindowIndicator': '메인 창 표시기',
		'setting.popoutWindowIndicator': '팝업 창 표시기',
		'setting.mainWindowIndicatorDesc': '기본적으로, 표시기는 메인 창이 고정되었을 때만 표시되고 고정이 해제되면 사라집니다.',
		'setting.popoutWindowIndicatorDesc': '기본적으로, 표시기는 메인 창이 고정되었을 때만 표시되고 고정이 해제되면 사라집니다.',
		'setting.customPopoutCommands': '커스텀 팝업 명령어',
		'setting.customPopoutCommandsDesc': '다양한 설정으로 팝업 창을 열기 위한 커스텀 명령어를 만들 수 있습니다.',
		'setting.miscellaneous': '기타',
		'setting.miscellaneousDesc': '플러그인을 위한 기타 설정입니다.',
		'setting.dateFormat': '날짜 형식',
		'setting.dateFormatDesc': '{{date}} 치환을 위한 형식 (예: YYYY-MM-DD)',

		// 표시기 설정
		'setting.topOffset': '상단 여백 (px)',
		'setting.topOffsetDesc': '창의 상단 모서리로부터의 거리입니다.',
		'setting.rightOffset': '우측 여백 (px)',
		'setting.rightOffsetDesc': '창의 우측 모서리로부터의 거리입니다.',
		'setting.indicatorSize': '표시기 크기 (px)',
		'setting.indicatorSizeDesc': '표시기 박스의 너비와 높이입니다.',
		'setting.iconSize': '아이콘 크기 (px)',
		'setting.iconSizeDesc': '표시기 내부 아이콘의 크기입니다.',
		'setting.default': '기본값',
		'setting.resetToDefault': '기본값으로 초기화: {{value}}',

		// 커스텀 명령어
		'setting.addCommand': '+ 명령어 추가',
		'setting.noCustomCommands': '아직 커스텀 명령어가 없습니다.',
		'setting.blank': '빈 탭',
		'setting.file': '파일',
		'setting.folder': '폴더',
		'setting.journal': '저널',
		'setting.copyURI': 'URI 복사',
		'setting.delete': '삭제',
		'setting.enterFilePath': '파일 경로를 입력하세요',
		'setting.enterFolderPath': '폴더 경로를 입력하세요',
		'setting.filenameRule': '파일명 규칙 ({{date}} 선택사항)',
		'setting.enterTemplatePath': '템플릿 파일 경로를 입력하세요',
		'setting.blankDescription': '새로운 빈 항상-위-팝업 창을 엽니다',

		// 저널 설정
		'journal.daily': '일간노트',
		'journal.weekly': '주간노트',
		'journal.monthly': '월간노트',
		'journal.quarterly': '분기노트',
		'journal.yearly': '연간노트',

		// 커스텀 명령어 이름
		'customCommand.blank': '비어있는 고정 팝업창 열기',
		'customCommand.file': '<{{filename}}>을 고정 팝업창에서 열기',
		'customCommand.folder': '<{{folder}}>에서 새 노트를 만들어 고정 팝업창에서 열기',
		'customCommand.journal': '<{{period}}> 노트를 고정 팝업창에서 열기',

		// 유효성 검사 에러 메시지
		'validation.filePathRequired': '파일 경로가 필수입니다.',
		'validation.fileNotExists': '파일이 존재하지 않습니다: {{path}}',
		'validation.folderNotExists': '폴더가 존재하지 않습니다: {{path}}',
		'validation.filenameRuleRequired': '파일명 규칙이 필수입니다.',
		'validation.invalidCharacters': '파일명에 유효하지 않은 문자가 있습니다: {{filename}}',
		'validation.templateNotExists': '템플릿 파일이 존재하지 않습니다: {{path}}',

		// UI 텍스트
		'ui.enabled': '활성화됨',
		'ui.disabled': '비활성화됨',
		'ui.settings': '설정',
		'ui.save': '저장',
		'ui.cancel': '취소',

		// 알림 메시지
		'notice.windowPinned': '창이 고정되었습니다',
		'notice.windowUnpinned': '창이 고정 해제되었습니다',
		'notice.windowControlUnavailable': '창 제어가 불가능합니다',
		'notice.uriCopied': '커스텀 팝업 #{{number}} URI가 클립보드에 복사되었습니다',
	},
	en: {
		// Tab menu
		'menu.openInNewPinnedWindow': 'Open in new pinned window',
		'menu.openInNewPinnedWindowExclusive': 'Open in new pinned window (exclusive)',

		// Commands
		'command.openAlwaysOnTopPopout': 'Open in new Always-on-Top popout window',
		'command.openAlwaysOnTopPopoutExclusive': 'Open in new Always-on-Top popout window (exclusive)',
		'command.openCustomPopout': 'Open custom popout',
		'command.toggleWindowPin': 'Toggle window pin',

		// Settings
		'setting.title': 'Always-on-Top settings',
		'setting.showIndicatorInMainWindow': 'Show indicator in main window',
		'setting.showIndicatorInPopoutWindows': 'Show indicator in popout windows',
		'setting.indicator': 'Indicator settings',
		'setting.mainWindowIndicator': 'Main window indicator',
		'setting.popoutWindowIndicator': 'Pop-out window indicator',
		'setting.mainWindowIndicatorDesc': 'By default, the pin indicator appears only when the main window is pinned, and disappears when unpinned.',
		'setting.popoutWindowIndicatorDesc': 'By default, the pin indicator appears only when the main window is pinned, and disappears when unpinned.',
		'setting.customPopoutCommands': 'Custom popout commands',
		'setting.customPopoutCommandsDesc': 'Create custom commands for opening pop-out windows with different configurations.',
		'setting.miscellaneous': 'Miscellaneous',
		'setting.miscellaneousDesc': 'Miscellaneous settings for the plugin.',
		'setting.dateFormat': 'Date format',
		'setting.dateFormatDesc': 'Format for {{date}} substitution (e.g., YYYY-MM-DD)',

		// Indicator settings
		'setting.topOffset': 'Top offset (px)',
		'setting.topOffsetDesc': 'Distance from the top edge of the {{window}}.',
		'setting.rightOffset': 'Right offset (px)',
		'setting.rightOffsetDesc': 'Distance from the right edge of the {{window}}.',
		'setting.indicatorSize': 'Indicator size (px)',
		'setting.indicatorSizeDesc': 'Width and height of the indicator box.',
		'setting.iconSize': 'Icon size (px)',
		'setting.iconSizeDesc': 'Size of the icon inside the indicator.',
		'setting.default': 'Default',
		'setting.resetToDefault': 'Reset to default: {{value}}',

		// Custom commands
		'setting.addCommand': '+ Add command',
		'setting.noCustomCommands': 'No custom commands yet.',
		'setting.blank': 'Blank',
		'setting.file': 'File',
		'setting.folder': 'Folder',
		'setting.journal': 'Journal',
		'setting.copyURI': 'Copy URI',
		'setting.delete': 'Delete',
		'setting.enterFilePath': 'Enter a file path',
		'setting.enterFolderPath': 'Enter a folder path',
		'setting.filenameRule': 'Filename rule ({{date}} optional)',
		'setting.enterTemplatePath': 'Enter a template file path',
		'setting.blankDescription': 'Open a new blank Always-on-Top popout window',

		// Journal settings
		'journal.daily': 'Daily',
		'journal.weekly': 'Weekly',
		'journal.monthly': 'Monthly',
		'journal.quarterly': 'Quarterly',
		'journal.yearly': 'Yearly',

		// Custom command names
		'customCommand.blank': 'Open a new blank Always-on-Top popout window',
		'customCommand.file': 'Open <{{filename}}> in a new Always-on-Top popout window',
		'customCommand.folder': 'Create a new note in <{{folder}}> and open it in a new Always-on-Top popout window',
		'customCommand.journal': 'Open <{{period}}> journal in a new Always-on-Top popout window',

		// Validation error messages
		'validation.filePathRequired': 'File path is required.',
		'validation.fileNotExists': 'File does not exist: {{path}}',
		'validation.folderNotExists': 'Folder does not exist: {{path}}',
		'validation.filenameRuleRequired': 'File name rule is required.',
		'validation.invalidCharacters': 'Invalid characters in file name: {{filename}}',
		'validation.templateNotExists': 'Template file does not exist: {{path}}',

		// UI text
		'ui.enabled': 'Enabled',
		'ui.disabled': 'Disabled',
		'ui.settings': 'Settings',
		'ui.save': 'Save',
		'ui.cancel': 'Cancel',

		// Notification messages
		'notice.windowPinned': 'Window pinned on top',
		'notice.windowUnpinned': 'Window unpinned',
		'notice.windowControlUnavailable': 'Unable to control the window',
		'notice.uriCopied': 'Custom Popout #{{number}} URI copied to clipboard',
	},
};

/**
 * i18n 매니저 클래스
 * 언어를 설정하고 번역된 메시지를 가져옵니다.
 * Obsidian의 설정된 언어를 자동으로 감지합니다.
 */
export class I18nManager {
	private currentLanguage: Language = 'en';

	constructor() {
		// Obsidian의 설정된 언어에 따라 기본 언어 설정
		this.initLanguage();
	}

	/**
	 * Obsidian의 설정된 언어 감지 및 초기화
	 */
	private initLanguage(): void {
		// 브라우저의 언어 또는 Obsidian 설정 언어 감지
		const appLocale = moment.locale();
		
		if (appLocale?.startsWith('ko')) {
			this.currentLanguage = 'ko';
		} else {
			this.currentLanguage = 'en';
		}
	}

	/**
	 * 현재 언어 반환
	 */
	getLanguage(): Language {
		return this.currentLanguage;
	}

	/**
	 * 언어 설정
	 */
	setLanguage(lang: Language): void {
		if (lang === 'ko' || lang === 'en') {
			this.currentLanguage = lang;
		}
	}

	/**
	 * 번역 메시지 가져오기
	 * @param key - 번역 키 (예: 'menu.openInNewPinnedWindow')
	 * @param params - 옵션: 메시지에 동적 값을 삽입할 경우 사용
	 * @returns 번역된 메시지
	 */
	t(key: string, params?: Record<string, string>): string {
		const translation = TRANSLATIONS[this.currentLanguage][key] || key;

		if (params) {
			return Object.entries(params).reduce((result, [paramKey, paramValue]) => {
				return result.replace(`{{${paramKey}}}`, paramValue);
			}, translation);
		}

		return translation;
	}

	/**
	 * 특정 언어로 번역 메시지 가져오기
	 * @param lang - 언어
	 * @param key - 번역 키
	 * @returns 번역된 메시지
	 */
	tLang(lang: Language, key: string): string {
		return TRANSLATIONS[lang][key] || key;
	}
}

// 전역 i18n 인스턴스
export const i18n = new I18nManager();
