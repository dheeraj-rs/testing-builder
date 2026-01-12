'use client';

import { useStore } from '@nanostores/react';
import { Chat } from '@/app/(builder)/website-builder/components/chat/Chat';
import { Workbench } from '@/app/(builder)/website-builder/components/workbench/Workbench.client';
import { PanelContainer } from '@/app/(builder)/website-builder/components/panels/PanelContainer';
import { chatStore } from '@/app/(builder)/website-builder/lib/stores/chat';
import { workbenchStore } from '@/app/(builder)/website-builder/lib/stores/workbench';
import IsolatedContainer from '@/core/layouts/default-bar/IsolatedContainer';

export default function WebsiteBuilderChatPage() {
    const { showChat } = useStore(chatStore);
    const showWorkbench = useStore(workbenchStore.showWorkbench);

    return (
        <IsolatedContainer>
            <div className="flex flex-row h-screen w-full overflow-hidden">
                <PanelContainer
                    leftPanel={<Chat />}
                    rightPanel={<Workbench isStreaming={false} />}
                    showLeftPanel={showChat}
                    showRightPanel={showWorkbench}
                />
            </div>
        </IsolatedContainer>
    );
}
