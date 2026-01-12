import React from 'react'
import BuilderLayout from '@/core/layouts/BuilderLayout'

function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <BuilderLayout
        >
            {children}
        </BuilderLayout>
    )
}

export default MainLayout