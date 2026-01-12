'use client';
import React from 'react'

function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className='admin-login-page'>
            {children}
        </div>
    )
}

export default AuthLayout