import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed font-sans">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ ...props }) => (
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-4 mb-2 tracking-tight" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-3 mb-2 tracking-tight" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2 mb-1 tracking-tight" {...props} />
          ),
          p: ({ ...props }) => (
            <p className="mb-3 text-slate-700 dark:text-slate-300 last:mb-0" {...props} />
          ),
          ul: ({ ...props }) => (
            <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />
          ),
          li: ({ ...props }) => (
            <li className="text-slate-750 dark:text-slate-300 mb-1" {...props} />
          ),
          input: ({ ...props }) => {
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
          strong: ({ ...props }) => (
            <strong className="font-extrabold text-slate-950 dark:text-white" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
