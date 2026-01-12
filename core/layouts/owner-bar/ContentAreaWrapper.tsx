import React from 'react'

function ContentAreaWrapper({ children }: { children?: React.ReactNode }) {
    return (
        <div className="owner-dashboard-main">
            {children}
        </div>
    )
}

export default ContentAreaWrapper