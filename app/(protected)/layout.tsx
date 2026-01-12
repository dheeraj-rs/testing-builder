import React from 'react'
import OwnerLayout from '@/core/layouts/OwnerLayout'
import SideBarContent from './owner-dashboard/component/SideBarContent'
import TopBarContent from './owner-dashboard/component/TopBarContent'


function layout({ children }: { children: React.ReactNode }) {
    return (
        <OwnerLayout
            sidebarContent={<SideBarContent />}
            topbarContent={<TopBarContent />}
        >
            {children}
        </OwnerLayout>
    )
}

export default layout