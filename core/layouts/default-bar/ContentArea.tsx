import React from 'react'

function ContentArea({ children }: { children: React.ReactNode }) {
    return (
        <main className="layout__container">{children}</main>
    )
}

export default ContentArea