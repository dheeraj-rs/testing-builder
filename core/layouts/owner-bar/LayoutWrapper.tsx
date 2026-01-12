import React from 'react'

function LayoutWrapper({ children }: { children?: React.ReactNode }) {
    return (
        <div className="owner-dashboard-wrapper">
            <div className="dashboard-main-panel">
                {children}
            </div>
        </div>
    )
}

export default LayoutWrapper