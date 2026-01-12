/**
 * Custom hook for managing builder state
 */

import { useState } from 'react';

export function useBuilderState() {
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(
    null
  );
  const [currentTheme, setCurrentTheme] = useState<number>(0);
  const [showImageDialog, setShowImageDialog] = useState<boolean>(false);
  const [showButtonDialog, setShowButtonDialog] = useState<boolean>(false);
  const [showLinkDialog, setShowLinkDialog] = useState<boolean>(false);
  const [showSvgDialog, setShowSvgDialog] = useState<boolean>(false);

  const closeAllDialogs = () => {
    setShowImageDialog(false);
    setShowButtonDialog(false);
    setShowLinkDialog(false);
    setShowSvgDialog(false);
  };

  return {
    selectedElement,
    setSelectedElement,
    currentTheme,
    setCurrentTheme,
    showImageDialog,
    setShowImageDialog,
    showButtonDialog,
    setShowButtonDialog,
    showLinkDialog,
    setShowLinkDialog,
    showSvgDialog,
    setShowSvgDialog,
    closeAllDialogs,
  };
}
