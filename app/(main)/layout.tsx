import React from 'react';
import IsolatedContainer from '@/core/layouts/default-bar/IsolatedContainer';
import Layout from '@/core/layouts/Layout';

function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <Layout>
            <IsolatedContainer>
                {children}
            </IsolatedContainer>
        </Layout>
    );
}

export default MainLayout;
