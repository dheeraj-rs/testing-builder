import React from 'react'
import LayoutWrapper from './owner-bar/LayoutWrapper'
import Sidebar from './owner-bar/Sidebar'
import ContentAreaWrapper from './owner-bar/ContentAreaWrapper'
import Topbar from './owner-bar/Topbar'
import ContentArea from './owner-bar/ContentArea'

interface OwnerLayoutProps {
    children: React.ReactNode;
    sidebarContent?: React.ReactNode;
    topbarContent?: React.ReactNode;
}

function OwnerLayout({ children, sidebarContent, topbarContent }: OwnerLayoutProps) {
    return (
        <LayoutWrapper>
            <Sidebar >
                {sidebarContent}
            </Sidebar>
            <ContentAreaWrapper>
                <Topbar >
                    {topbarContent}
                </Topbar>
                <ContentArea >
                    {children}
                </ContentArea>
            </ContentAreaWrapper>
        </LayoutWrapper>
    )
}

export default OwnerLayout