import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
// @ts-expect-error — CSS import
import 'highlight.js/styles/github.css';
import TermTooltip from '../components/TermTooltip';

// URL prefix used to smuggle a glossary term reference through the markdown AST
// as an ordinary link, then intercept it in the custom `a` renderer below.
const TERM_URL = '#glossary-term:';

/**
 * remark plugin: rewrite `{{term:slug}}` occurrences in text nodes into link
 * nodes. Operating on the AST (not the raw string) means code blocks and inline
 * code are naturally skipped — their content never appears as `text` nodes.
 */
function remarkTerms() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any) => walk(tree);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function walk(node: any) {
    if (!Array.isArray(node.children)) return;
    const next: unknown[] = [];
    for (const child of node.children) {
      if (
        child.type === 'text' &&
        typeof child.value === 'string' &&
        child.value.includes('{{term:')
      ) {
        next.push(...splitTermText(child.value));
      } else {
        walk(child);
        next.push(child);
      }
    }
    node.children = next;
  }

  function splitTermText(value: string) {
    const re = /\{\{term:([a-z0-9-]+)(?:\|([^}]+))?\}\}/g;
    const out: unknown[] = [];
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(value)) !== null) {
      if (m.index > last) out.push({ type: 'text', value: value.slice(last, m.index) });
      const slug = m[1];
      const display = m[2] ?? slug;
      out.push({
        type: 'link',
        url: `${TERM_URL}${slug}`,
        children: [{ type: 'text', value: display }],
      });
      last = m.index + m[0].length;
    }
    if (last < value.length) out.push({ type: 'text', value: value.slice(last) });
    return out;
  }
}

type Props = {
  children: string;
  className?: string;
};

export function Markdown({ children, className = '' }: Props) {
  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkTerms]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          a({ href, children: linkChildren, ...rest }) {
            if (href && href.startsWith(TERM_URL)) {
              const slug = href.slice(TERM_URL.length);
              return <TermTooltip slug={slug}>{linkChildren}</TermTooltip>;
            }
            return (
              <a href={href} {...rest}>
                {linkChildren}
              </a>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
