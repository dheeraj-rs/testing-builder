'use client'
import React, { useState } from 'react'
import { Menu, X } from 'lucide-react'

function Sidebar({ children }: { children?: React.ReactNode }) {
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    return (
        <>
            <button
                className={`dashboard-sidebar-mobile-toggle ${isMobileOpen ? 'hidden' : ''}`}
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                aria-label="Toggle menu"
            >
                <Menu size={24} />
            </button>
            <div className={`dashboard-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
                {isMobileOpen && (
                    <button
                        className="dashboard-sidebar-close"
                        onClick={() => setIsMobileOpen(false)}
                        aria-label="Close menu"
                    >
                        <X size={24} />
                    </button>
                )}
                {children}
            </div>
            {isMobileOpen && (
                <div
                    className="dashboard-sidebar-overlay"
                    onClick={() => setIsMobileOpen(false)}
                    aria-hidden="true"
                />
            )}
        </>
    )
}

export default Sidebar