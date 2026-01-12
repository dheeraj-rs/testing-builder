import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

const AppTopbarNotifications: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const toggleNotifications = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="topbar-notification-wrapper" ref={wrapperRef}>
            <button
                className="p-link layout-topbar-button"
                title="Notifications"
                onClick={toggleNotifications}
            >
                <i className="pi pi-bell" />
                <span className="notification-badge">3</span>
            </button>

            {isOpen && (
                <div className="layout__notification-modal">
                    <div className="notification-modal-header">
                        <h3>Notifications</h3>
                        <button className="notification-clear-all">
                            <i className="pi pi-check-circle" />
                            <span>Clear All</span>
                        </button>
                    </div>

                    <div className="notification-modal-body">
                        <div className="notification-list">
                            <div className="notification-item unread">
                                <div className="notification-icon">
                                    <i className="pi pi-bell" />
                                </div>
                                <div className="notification-content">
                                    <h4 className="notification-title">Sample Notification</h4>
                                    <p className="notification-desc">This is a sample notification message</p>
                                    <span className="notification-time">Just now</span>
                                </div>
                                <span className="notification-unread-dot" />
                            </div>
                        </div>
                    </div>

                    <div className="notification-modal-footer">
                        <Link href="/messages">
                            View All Messages
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppTopbarNotifications;
