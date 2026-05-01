import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface RichTextEditorProps {
    content: string;
    setContent: (content: string) => void;
    height?: string;
}

export function RichTextEditor({ content, setContent, height = '600px' }: RichTextEditorProps) {
    const { t } = useTranslation();
    const editorRef = useRef<HTMLDivElement>(null);
    const [activeCommands, setActiveCommands] = useState<string[]>([]);

    // 将 Markdown 转换为 HTML（简单转换）
    const markdownToHtml = (md: string): string => {
        let html = md;
        // 标题
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        // 粗体
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // 斜体
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        // 链接
        html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
        // 换行
        html = html.replace(/\n/g, '<br>');
        return html;
    };

    // 将 HTML 转换为 Markdown（简单转换）
    const htmlToMarkdown = (html: string): string => {
        let md = html;
        // 移除 HTML 标签并转换
        md = md.replace(/<h1>(.*?)<\/h1>/gi, '# $1');
        md = md.replace(/<h2>(.*?)<\/h2>/gi, '## $1');
        md = md.replace(/<h3>(.*?)<\/h3>/gi, '### $1');
        md = md.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
        md = md.replace(/<b>(.*?)<\/b>/gi, '**$1**');
        md = md.replace(/<em>(.*?)<\/em>/gi, '*$1*');
        md = md.replace(/<i>(.*?)<\/i>/gi, '*$1*');
        md = md.replace(/<a href="(.*?)">(.*?)<\/a>/gi, '[$2]($1)');
        md = md.replace(/<br\s*\/?>/gi, '\n');
        md = md.replace(/<p>/gi, '');
        md = md.replace(/<\/p>/gi, '\n');
        md = md.replace(/<div>/gi, '');
        md = md.replace(/<\/div>/gi, '\n');
        // 移除剩余 HTML 标签
        md = md.replace(/<[^>]+>/g, '');
        return md.trim();
    };

    useEffect(() => {
        if (editorRef.current && content) {
            editorRef.current.innerHTML = markdownToHtml(content);
        }
    }, []);

    const execCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        updateActiveCommands();
    };

    const updateActiveCommands = () => {
        const commands = ['bold', 'italic', 'underline', 'insertUnorderedList', 'insertOrderedList'];
        const active = commands.filter(cmd => document.queryCommandState(cmd));
        setActiveCommands(active);
    };

    const handleInput = () => {
        if (editorRef.current) {
            const html = editorRef.current.innerHTML;
            const md = htmlToMarkdown(html);
            setContent(md);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            document.execCommand('insertLineBreak');
            e.preventDefault();
        }
    };

    return (
        <div className="border rounded-xl overflow-hidden bg-w">
            {/* 工具栏 */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50 dark:bg-gray-800">
                <button
                    type="button"
                    onClick={() => execCommand('bold')}
                    className={`px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${activeCommands.includes('bold') ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                    title={t('bold') || '粗体'}
                >
                    <strong>B</strong>
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('italic')}
                    className={`px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${activeCommands.includes('italic') ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                    title={t('italic') || '斜体'}
                >
                    <em>I</em>
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('underline')}
                    className={`px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${activeCommands.includes('underline') ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                    title={t('underline') || '下划线'}
                >
                    <u>U</u>
                </button>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                <button
                    type="button"
                    onClick={() => execCommand('insertUnorderedList')}
                    className={`px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${activeCommands.includes('insertUnorderedList') ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                    title={t('bullet_list') || '无序列表'}
                >
                    • 列表
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('insertOrderedList')}
                    className={`px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${activeCommands.includes('insertOrderedList') ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                    title={t('number_list') || '有序列表'}
                >
                    1. 列表
                </button>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                <button
                    type="button"
                    onClick={() => {
                        const url = prompt(t('enter_url') || '请输入链接地址：');
                        if (url) execCommand('createLink', url);
                    }}
                    className="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    title={t('link') || '链接'}
                >
                    🔗
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('formatBlock', 'h2')}
                    className="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-sm"
                    title={t('heading') || '标题'}
                >
                    H
                </button>
            </div>

            {/* 编辑区域 */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onKeyUp={updateActiveCommands}
                onMouseUp={updateActiveCommands}
                onKeyDown={handleKeyDown}
                className="p-4 overflow-auto focus:outline-none t-primary"
                style={{ height, minHeight: '200px' }}
                suppressContentEditableWarning={true}
            />
        </div>
    );
}
