import { useState, type FC } from 'react';
import { Markdown } from '../Markdown/Markdown';
import { ChevronDown, ChevronUp } from 'lucide-react';

type ExpandableTextProps = {
  text?: string | null;
  maxLength: number;
  initialIsExpanded?: boolean;
};

const ExpandableText: FC<ExpandableTextProps> = ({
  text,
  maxLength,
  initialIsExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(initialIsExpanded);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (!text) {
    return null;
  }

  const isTruncated = text.length > maxLength;
  const displayText = isExpanded ? text : isTruncated ? `${text.substring(0, maxLength)}...` : text;

  return (
    <div className='space-y-2'>
      <div className='text-slate-300'>
        {isTruncated && !isExpanded ? displayText : <Markdown content={displayText} />}
      </div>
      {isTruncated && (
        <button
          onClick={toggleExpand}
          className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-nav border border-surface-border hover:border-brand/50 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all'
        >
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
      )}
    </div>
  );
};

export default ExpandableText;
