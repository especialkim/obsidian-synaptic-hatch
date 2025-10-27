import type AlwaysOnTopPlugin from '../../main';
import type { CustomPopoutCommand } from '../setting/settings';
import { TFile, TFolder, moment } from 'obsidian';

export function getFileNameOfPath(path: string){
    return path.split('/').pop() || path;
}

export function getFolderNameOfPath(path: string) {
    const parts = path.split('/').filter(Boolean);

    if (parts.length === 0) {
        return '';
    }

    const last = parts[parts.length - 1];

    if (last.includes('.')) {
        if (parts.length >= 2) {
            return parts[parts.length - 2] || '';
        } else {
            return '';
        }
    }

    return last;
}

export function getCustomCommandURI(plugin: AlwaysOnTopPlugin, cmd: CustomPopoutCommand): string {
    const vaultName = encodeURIComponent(plugin.app.vault.getName());
    return `obsidian://custom-command?vault=${vaultName}&id=${cmd.id}`;
}

/**
 * 파일 경로가 실제로 존재하는지 확인
 */
export function isFileExists(plugin: AlwaysOnTopPlugin, filePath: string): boolean {
    if (!filePath) return false;
    const file = plugin.app.vault.getAbstractFileByPath(filePath);
    return file instanceof TFile;
}

/**
 * 폴더 경로가 실제로 존재하는지 확인
 */
export function isFolderExists(plugin: AlwaysOnTopPlugin, folderPath: string): boolean {
    if (!folderPath) return true; // 빈 문자열은 최상위 폴더를 의미하므로 유효
    const folder = plugin.app.vault.getAbstractFileByPath(folderPath);
    return folder instanceof TFolder;
}

/**
 * 파일명에 사용할 수 없는 특수문자 체크
 */
export function hasInvalidFileNameCharacters(fileName: string): boolean {
    // Obsidian/시스템에서 파일명에 사용할 수 없는 문자들
    const invalidChars = /[\\/:*?"<>|]/;
    return invalidChars.test(fileName);
}

/**
 * 파일명 규칙을 실제 파일명으로 변환 (날짜 치환 포함)
 */
export function resolveFileNameRule(fileNameRule: string, dateFormat: string): string {
    const date = moment().format(dateFormat);
    return fileNameRule.replace(/\{\{Date\}\}/g, date).replace(/\{\{date\}\}/g, date);
}