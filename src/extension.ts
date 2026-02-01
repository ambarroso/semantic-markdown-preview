import * as vscode from 'vscode';
import { rdfMarkdownPlugin } from './markdown-it-plugin';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "semantic-markdown-preview" is now active!');

    return {
        extendMarkdownIt(md: any) {
            return md.use(rdfMarkdownPlugin);
        }
    };
}

export function deactivate() { }
