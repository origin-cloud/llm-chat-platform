import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css'; 
import { sanitizeHTML } from './security';

//创建一个markdown实例
const md: MarkdownIt = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
    highlight: function (str: string, lang: string): string {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return '<pre class="hljs"><code>' +
                    hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                    '</code></pre>';
            } catch (__) { }
        }

        return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
    }
});

export function renderMarkdown(content: string): string {
    const rendered = md.render(content);
  // 使用DOMPurify进行二次安全清理
  return sanitizeHTML(rendered);
}
