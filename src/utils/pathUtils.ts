import type AlwaysOnTopPlugin from '../../main';
import type { CustomPopoutCommand } from '../settings';

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