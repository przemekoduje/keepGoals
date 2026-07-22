import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  onChange?: (newContent: string) => void;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, onChange }) => {
  const urlTransform = (url: string) => {
    if (url.startsWith("data:")) return url;
    try {
      const scheme = url.split(":")[0].toLowerCase();
      if (["http", "https", "mailto", "tel"].includes(scheme)) {
        return url;
      }
    } catch (e) {
      // ignore parsing errors
    }
    return "";
  };

  const markdownComponents = {
    h1: ({ ...props }: any) => (
      <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-4 mb-2 tracking-tight" {...props} />
    ),
    h2: ({ ...props }: any) => (
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-3 mb-2 tracking-tight" {...props} />
    ),
    h3: ({ ...props }: any) => (
      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2 mb-1 tracking-tight" {...props} />
    ),
    p: ({ ...props }: any) => (
      <p className="mb-3 text-slate-700 dark:text-slate-300 last:mb-0" {...props} />
    ),
    img: ({ ...props }: any) => (
      <img className="max-w-full h-auto rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 my-3" {...props} />
    ),
    ul: ({ ...props }: any) => (
      <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />
    ),
    ol: ({ ...props }: any) => (
      <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />
    ),
    li: ({ ...props }: any) => (
      <li className="text-slate-755 dark:text-slate-300 mb-1" {...props} />
    ),
    input: ({ ...props }: any) => {
      if (props.type === "checkbox") {
        return (
          <input
            type="checkbox"
            checked={props.checked}
            disabled
            className="rounded-[6px] border-slate-350 text-slate-900 dark:border-slate-600 h-4.5 w-4.5 mr-2 accent-slate-900 dark:accent-slate-100 align-middle"
            {...props}
          />
        );
      }
      return <input {...props} />;
    },
    strong: ({ ...props }: any) => (
      <strong className="font-extrabold text-slate-950 dark:text-white" {...props} />
    ),
  };

  const hasChecklist = /^\s*-\s+\[[ x]\]/mi.test(content);

  if (hasChecklist && onChange) {
    const lines = content.split("\n");
    const activeItems: { text: string; lineIndex: number }[] = [];
    const completedItems: { text: string; lineIndex: number }[] = [];
    const headerLines: string[] = [];
    const footerLines: string[] = [];

    let checklistStarted = false;

    lines.forEach((line, index) => {
      const activeMatch = /^\s*-\s+\[\s*\]\s*(.*)$/.exec(line);
      const completedMatch = /^\s*-\s+\[x\]\s*(.*)$/i.exec(line);

      if (activeMatch) {
        checklistStarted = true;
        activeItems.push({ text: activeMatch[1], lineIndex: index });
      } else if (completedMatch) {
        checklistStarted = true;
        completedItems.push({ text: completedMatch[1], lineIndex: index });
      } else {
        if (!checklistStarted) {
          headerLines.push(line);
        } else {
          footerLines.push(line);
        }
      }
    });

    const toggleItem = (lineIndex: number, currentCompleted: boolean) => {
      const newLines = [...lines];
      const text = currentCompleted 
        ? /^\s*-\s+\[x\]\s*(.*)$/i.exec(lines[lineIndex])?.[1] || ""
        : /^\s*-\s+\[\s*\]\s*(.*)$/.exec(lines[lineIndex])?.[1] || "";
      
      newLines[lineIndex] = currentCompleted ? `- [ ] ${text}` : `- [x] ${text}`;
      onChange(newLines.join("\n"));
    };

    return (
      <div className="space-y-4 font-sans text-sm">
        {headerLines.length > 0 && (
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]} urlTransform={urlTransform} components={markdownComponents}>
              {headerLines.join("\n")}
            </ReactMarkdown>
          </div>
        )}

        {/* Active items list */}
        {activeItems.length > 0 && (
          <div className="space-y-2">
            {activeItems.map((item) => (
              <label
                key={item.lineIndex}
                className="flex items-center space-x-2.5 cursor-pointer select-none group text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <input
                  type="checkbox"
                  checked={false}
                  onChange={() => toggleItem(item.lineIndex, false)}
                  className="rounded border-slate-350 dark:border-slate-600 text-slate-900 dark:text-slate-100 h-4.5 w-4.5 accent-slate-900 dark:accent-slate-100 transition-all cursor-pointer"
                />
                <span className="leading-none">{item.text}</span>
              </label>
            ))}
          </div>
        )}

        {/* Divider and completed items */}
        {completedItems.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Wykreślone elementy ({completedItems.length})
            </div>
            <div className="space-y-2">
              {completedItems.map((item) => (
                <label
                  key={item.lineIndex}
                  className="flex items-center space-x-2.5 cursor-pointer select-none group text-slate-400 dark:text-slate-550 hover:text-slate-600 dark:hover:text-slate-350 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={true}
                    onChange={() => toggleItem(item.lineIndex, true)}
                    className="rounded border-slate-300 dark:border-slate-700 text-slate-400 h-4.5 w-4.5 accent-slate-300 dark:accent-slate-700 transition-all cursor-pointer"
                  />
                  <span className="line-through leading-none">{item.text}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {footerLines.length > 0 && (
          <div className="prose dark:prose-invert max-w-none pt-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]} urlTransform={urlTransform} components={markdownComponents}>
              {footerLines.join("\n")}
            </ReactMarkdown>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed font-sans">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        urlTransform={urlTransform}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
