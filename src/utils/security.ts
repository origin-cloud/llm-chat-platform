import DOMPurify from 'dompurify';

// 配置DOMPurify的安全选项
const sanitizeConfig = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'code', 'pre', 'blockquote', 'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'img', 'span', 'div'
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'class', 'style', 'target'
  ],
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
  FORBID_ATTR: ['onclick', 'onload', 'onerror', 'style']
};

/**
 * 安全地清理HTML内容，防止XSS攻击
 */
export function sanitizeHTML(html: string): string {
  try {
    return DOMPurify.sanitize(html, sanitizeConfig);
  } catch (error) {
    console.error('HTML sanitization failed:', error);
    // 如果清理失败，返回转义的HTML
    return html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }
}

/**
 * 检查内容是否包含潜在的XSS攻击
 */
export function hasXSS(content: string): boolean {
  const dangerousPatterns = [
    /<script\b[^>]*>([\s\S]*?)<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:\s*text\/html/gi,
    /vbscript:/gi
  ];
  
  return dangerousPatterns.some(pattern => pattern.test(content));
}

/**
 * 安全地渲染Markdown内容
 */
export function safeRenderMarkdown(content: string): string {
  if (hasXSS(content)) {
    console.warn('Potential XSS detected in markdown content');
    return sanitizeHTML(content);
  }
  return content;
}