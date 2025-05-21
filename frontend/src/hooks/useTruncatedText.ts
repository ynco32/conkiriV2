import { useState } from 'react';

interface UseTruncatedTextReturn {
  showFullContent: boolean;
  displayText: string;
  isLongContent: boolean;
  toggleContent: () => void;
}

export const useTruncatedText = (
  text: string,
  maxLength: number = 30
): UseTruncatedTextReturn => {
  const [showFullContent, setShowFullContent] = useState(false);
  const isLongContent = text.length > maxLength;

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const displayText = showFullContent ? text : truncateText(text, maxLength);

  const toggleContent = () => {
    setShowFullContent(!showFullContent);
  };

  return {
    showFullContent,
    displayText,
    isLongContent,
    toggleContent,
  };
};
