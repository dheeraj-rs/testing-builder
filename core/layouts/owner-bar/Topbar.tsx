import React from 'react'

function Topbar({ children }: { children?: React.ReactNode }) {
    return (
        <div className="dashboard-topbar">
            {children}
        </div>
    )
}

export default Topbar