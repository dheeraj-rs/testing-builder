'use client';

import { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../config/queryClient';
import { LanguageProvider } from './LanguageProvider';
import { useLayoutStore } from '../store';
import { ThemeProvider } from './ThemeProvider';

interface AppProvidersProps {
    children: ReactNode;
}

function HydrationGuard({ children }: { children: ReactNode }) {
    const isHydrated = useLayoutStore((state) => state.isHydrated);
    if (!isHydrated) {
        return (
            <div style={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--d-admin-surface-ground, #1e1e1e)',
            }}>
                <div className="spinner" style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid rgba(255, 255, 255, 0.1)',
                    borderTop: '4px solid var(--d-admin-primary-color, #6366f1)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                }} />
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return <>{children}</>;
}

function ThemeWrapper({ children }: { children: ReactNode }) {
    const layoutConfig = useLayoutStore((state) => state.layoutConfig);
    const setLayoutConfig = useLayoutStore((state) => state.setLayoutConfig);

    return (
        <ThemeProvider
            layoutConfig={layoutConfig}
            setLayoutConfig={setLayoutConfig}
        >{' '}
            {children}
        </ThemeProvider>
    );
}

export default function AppProviders({ children }: AppProvidersProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <LanguageProvider>
                <ThemeWrapper>
                    <HydrationGuard>
                        <PermissionGate>
                            {children}
                        </PermissionGate>
                    </HydrationGuard>
                </ThemeWrapper>
            </LanguageProvider>
        </QueryClientProvider>
    );
}


function PermissionGate({ children }: { children: ReactNode }) {
    // Auth logic disabled due to missing dependencies (useAuth, PUBLIC_PATHS, etc.)
    return <>{children}</>;
}


