import React from 'react';
import AuthLayout from '@/core/layouts/AuthLayout';

function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthLayout>
            {children}
        </AuthLayout>
    );
}

export default MainLayout;
