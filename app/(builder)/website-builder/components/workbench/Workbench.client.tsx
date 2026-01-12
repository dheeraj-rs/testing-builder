import { useStore } from '@nanostores/react';
import { computed } from 'nanostores';
import { memo, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  type OnChangeCallback as OnEditorChange,
  type OnScrollCallback as OnEditorScroll,
} from '@/app/(builder)/website-builder/components/editor/codemirror/CodeMirrorEditor';
import { IconButton } from '@/app/(builder)/website-builder/components/ui/IconButton';
import { PanelHeaderButton } from '@/app/(builder)/website-builder/components/ui/PanelHeaderButton';
import { Slider, type SliderOptions } from '@/app/(builder)/website-builder/components/ui/Slider';
import { workbenchStore, type WorkbenchViewType } from '@/app/(builder)/website-builder/lib/stores/workbench';
import { renderLogger } from '@/app/(builder)/website-builder/utils/logger';
import { EditorPanel } from './EditorPanel';
import { Preview } from './Preview';

interface WorkspaceProps {
  isStreaming?: boolean;
}



const sliderOptions: SliderOptions<WorkbenchViewType> = {
  left: {
    value: 'code',
    text: 'Code',
  },
  right: {
    value: 'preview',
    text: 'Preview',
  },
};

export const Workbench = memo(({ isStreaming }: WorkspaceProps) => {
  renderLogger.trace('Workbench');

  const selectedView = useStore(workbenchStore.currentView);
  const currentDocument = useStore(workbenchStore.currentDocument);
  const unsavedFiles = useStore(workbenchStore.unsavedFiles);
  const files = useStore(workbenchStore.files);
  const selectedFile = useStore(workbenchStore.selectedFile);

  const setSelectedView = (view: WorkbenchViewType) => {
    workbenchStore.currentView.set(view);
  };

  const hasPreview = useStore(
    computed(workbenchStore.previews, (previews) => {
      return previews.length > 0;
    }),
  );

  useEffect(() => {
    if (hasPreview) {
      setSelectedView('preview');
    }
  }, [hasPreview]);

  useEffect(() => {
    workbenchStore.setDocuments(files);
  }, [files]);

  const onEditorChange = useCallback<OnEditorChange>((update) => {
    workbenchStore.setCurrentDocumentContent(update.content);
  }, []);

  const onEditorScroll = useCallback<OnEditorScroll>((position) => {
    workbenchStore.setCurrentDocumentScrollPosition(position);
  }, []);

  const onFileSelect = useCallback((filePath: string | undefined) => {
    workbenchStore.setSelectedFile(filePath);
  }, []);

  const onFileSave = useCallback(() => {
    workbenchStore.saveCurrentDocument().catch(() => {
      toast.error('Failed to update file content');
    });
  }, []);

  const onFileReset = useCallback(() => {
    workbenchStore.resetCurrentDocument();
  }, []);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-surface-0">
      <div className="flex items-center px-3 py-2 border-b border-surface">
        <Slider selected={selectedView} options={sliderOptions} setSelected={setSelectedView} />
        <div className="ml-auto" />
        {selectedView === 'code' && (
          <PanelHeaderButton
            className="mr-1 text-sm"
            onClick={() => {
              workbenchStore.toggleTerminal(!workbenchStore.showTerminal.get());
            }}
          >
            <div className="i-ph:terminal" />
            Toggle Terminal
          </PanelHeaderButton>
        )}
        <IconButton
          icon="i-ph:x-circle"
          className="-mr-1"
          size="xl"
          onClick={() => {
            workbenchStore.showWorkbench.set(false);
          }}
        />
      </div>
      <div className="relative flex-1 overflow-hidden">
        <View
          animate={{ x: selectedView === 'code' ? 0 : '-100%' }}
        >
          <EditorPanel
            editorDocument={currentDocument}
            isStreaming={isStreaming}
            selectedFile={selectedFile}
            files={files}
            unsavedFiles={unsavedFiles}
            onFileSelect={onFileSelect}
            onEditorScroll={onEditorScroll}
            onEditorChange={onEditorChange}
            onFileSave={onFileSave}
            onFileReset={onFileReset}
          />
        </View>
        <View
          animate={{ x: selectedView === 'preview' ? 0 : '100%' }}
        >
          <Preview />
        </View>
      </div>
    </div>
  );
});

Workbench.displayName = 'Workbench';

interface ViewProps {
  children: React.ReactNode;
  animate?: { x: number | string };
}

const View = memo(({ children, animate }: ViewProps) => {
  return (
    <div className="absolute inset-0" style={{ transform: `translateX(${typeof animate?.x === 'number' ? animate.x + 'px' : animate?.x || 0})` }}>
      {children}
    </div>
  );
});

View.displayName = 'View';
