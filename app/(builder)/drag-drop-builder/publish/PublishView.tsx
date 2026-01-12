'use client';

import { useState, useEffect } from 'react';
import { Rocket, Loader2, CheckCircle2, XCircle, ExternalLink, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

const DEPLOYMENT_STEPS = [
    { id: 1, label: 'Initiating deployment...', duration: 1000 },
    { id: 2, label: 'Building project files...', duration: 2000 },
    { id: 3, label: 'Optimizing assets...', duration: 1500 },
    { id: 4, label: 'Uploading to Vercel...', duration: 2000 },
    { id: 5, label: 'Finalizing deployment...', duration: 1000 },
];

export default function PublishView() {
    const [htmlContent, setHtmlContent] = useState('');
    const [projectName, setProjectName] = useState('');
    const [isDeploying, setIsDeploying] = useState(false);
    const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle');
    const [deploymentUrl, setDeploymentUrl] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Advanced Configuration State
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [envVars, setEnvVars] = useState<{ key: string; value: string }[]>([]);

    // Loading state
    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);

    // Load HTML content and generate project name on mount
    useEffect(() => {
        const uniqueSuffix = Math.random().toString(36).substring(2, 7);
        setProjectName(`my-page-${uniqueSuffix}`);

        // Load saved HTML from localStorage (saved by DragDropBuilder)
        const savedHtml = localStorage.getItem('drag-drop-builder-html');
        if (savedHtml) {
            setHtmlContent(savedHtml);
        }
    }, []);

    const getDeploymentFormat = () => {
        return localStorage.getItem('drag-drop-builder-format') || 'html';
    };

    /**
     * Extract all image URLs from HTML content that reference the /uploaded/ folder
     */
    const extractUploadedImageUrls = (htmlContent: string): string[] => {
        const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
        const urls: string[] = [];
        let match;

        while ((match = imgRegex.exec(htmlContent)) !== null) {
            const url = match[1];
            // Only include images from the /uploaded/ folder
            if (url.includes('/uploaded/')) {
                urls.push(url);
            }
        }

        return [...new Set(urls)]; // Remove duplicates
    };

    /**
     * Fetch an image and convert it to base64 data URI
     */
    const fetchImageAsBase64 = async (imageUrl: string): Promise<string> => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();

            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error(`Failed to fetch image: ${imageUrl}`, error);
            return imageUrl; // Return original URL if fetch fails
        }
    };

    const pollDeploymentStatus = async (deploymentId: string, teamId?: string) => {
        const pollInterval = setInterval(async () => {
            try {
                const url = teamId
                    ? `/api/deploy/status?id=${deploymentId}&teamId=${teamId}`
                    : `/api/deploy/status?id=${deploymentId}`;
                const response = await fetch(url);
                const data = await response.json();

                if (data.success) {
                    if (data.status === 'QUEUED' || data.status === 'INITIALIZING') {
                        setCurrentStep(1);
                        setProgress(10);
                    } else if (data.status === 'BUILDING' || data.status === 'ANALYZING') {
                        setCurrentStep(2);
                        setProgress(prev => Math.min(prev + 1, 60));
                    } else if (data.status === 'DEPLOYING') {
                        setCurrentStep(4);
                        setProgress(80);
                    } else if (data.status === 'READY') {
                        clearInterval(pollInterval);
                        setCurrentStep(6);
                        setProgress(100);

                        setTimeout(() => {
                            setDeploymentStatus('success');
                            setDeploymentUrl(data.url);
                            setIsDeploying(false);
                        }, 2000);
                    } else if (data.status === 'ERROR' || data.status === 'CANCELED') {
                        clearInterval(pollInterval);
                        setDeploymentStatus('error');
                        setErrorMessage('Deployment failed or was canceled by Vercel.');
                        setIsDeploying(false);
                    }
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, 3000);
    };

    const handleDeploy = async () => {
        if (!projectName || !htmlContent) return;

        setIsDeploying(true);
        setDeploymentStatus('deploying');
        setErrorMessage('');
        setCurrentStep(0);
        setProgress(0);

        try {
            // Extract uploaded image URLs and convert to base64
            const imageUrls = extractUploadedImageUrls(htmlContent);

            // Convert images to base64 and replace in HTML
            let processedHtml = htmlContent;
            for (const imageUrl of imageUrls) {
                const base64 = await fetchImageAsBase64(imageUrl);
                // Replace all occurrences of this image URL with base64
                processedHtml = processedHtml.replace(
                    new RegExp(imageUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
                    base64
                );
            }

            // Convert HTML content to deployable files with embedded images
            const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"></link>
</head>
<body>
${processedHtml}
</body>
</html>`;

            const deploymentFiles = [
                {
                    path: 'index.html',
                    content: fullHTML,
                },
            ];

            const response = await fetch('/api/deploy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    projectName,
                    files: deploymentFiles,
                    framework: null, // Static HTML deployment
                    envVars: showAdvanced ? envVars : [],
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                await pollDeploymentStatus(result.deploymentId, result.teamId);
            } else {
                throw new Error(result.error || 'Deployment failed');
            }
        } catch (error: any) {
            console.error('Deployment error:', error);
            setDeploymentStatus('error');
            setErrorMessage(error.message || 'An error occurred during deployment');
            setIsDeploying(false);
        }
    };

    const hasContent = htmlContent.trim().length > 0;

    return (
        <div className="flex flex-col h-screen bg-(--d-admin-surface-section) text-(--d-admin-text-color)">
            {/* Header */}
            <div className="bg-(--d-admin-surface-section) border-b border-(--d-admin-border) px-6 py-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/drag-drop-builder"
                        className="text-(--d-admin-text-color-secondary) hover:text-(--d-admin-text-color) transition-colors"
                    >
                        ← Back to Builder
                    </Link>
                    <div className="h-6 w-px bg-(--d-admin-surface-border)" />
                    <h1 className="text-xl font-semibold text-(--d-admin-text-color)">Deploy to Vercel</h1>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
                <div className="max-w-4xl mx-auto w-full p-8">
                    {deploymentStatus === 'idle' && (
                        <>
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <Rocket className="h-8 w-8 text-(--d-admin-blue-600)" />
                                    <h2 className="text-3xl font-bold text-(--d-admin-text-color)">Deploy to Vercel</h2>
                                </div>
                                <p className="text-(--d-admin-text-color-secondary)">
                                    Deploy your page to a global edge network with a single click.
                                </p>
                            </div>

                            <div className="bg-(--d-admin-surface-card) rounded-lg border border-(--d-admin-surface-border) p-6 mb-6">
                                <h3 className="text-xl font-semibold text-(--d-admin-text-color) mb-4">Deployment Configuration</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-(--d-admin-text-color-secondary) mb-2">
                                            Project Name
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={projectName}
                                                onChange={(e) => setProjectName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                                                placeholder="my-awesome-page"
                                                className="flex-1 px-3 py-2 bg-(--d-admin-surface-ground) border border-(--d-admin-surface-border) rounded-md text-(--d-admin-text-color) focus:outline-none focus:ring-2 focus:ring-(--d-admin-blue-500)"
                                            />
                                            <div className="px-3 py-2 bg-(--d-admin-surface-hover) border border-(--d-admin-surface-border) rounded-md text-(--d-admin-text-color-secondary)">
                                                .vercel.app
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-(--d-admin-surface-border) pt-4">
                                        <div className="flex items-center gap-3 mb-4">
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={showAdvanced}
                                                onClick={() => setShowAdvanced(!showAdvanced)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showAdvanced ? 'bg-(--d-admin-blue-600)' : 'bg-(--d-admin-surface-border)'
                                                    }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-(--d-admin-surface-card) transition-transform ${showAdvanced ? 'translate-x-6' : 'translate-x-1'
                                                        }`}
                                                />
                                            </button>
                                            <label className="text-sm font-medium text-(--d-admin-text-color-secondary) cursor-pointer" onClick={() => setShowAdvanced(!showAdvanced)}>
                                                Enable Advanced Configuration
                                            </label>
                                        </div>

                                        {showAdvanced && (
                                            <div className="space-y-4 pl-4 border-l-2 border-blue-200">
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <label className="block text-sm font-medium text-(--d-admin-text-color-secondary)">
                                                            Environment Variables
                                                        </label>
                                                        <button
                                                            onClick={() => setEnvVars([...envVars, { key: '', value: '' }])}
                                                            className="flex items-center gap-1 px-2 py-1 text-sm bg-(--d-admin-surface-ground) border border-(--d-admin-surface-border) rounded-md text-(--d-admin-text-color) hover:bg-(--d-admin-surface-hover) transition-colors"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                            Add
                                                        </button>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {envVars.map((env, index) => (
                                                            <div key={index} className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={env.key}
                                                                    onChange={(e) => {
                                                                        const newEnvVars = [...envVars];
                                                                        newEnvVars[index].key = e.target.value;
                                                                        setEnvVars(newEnvVars);
                                                                    }}
                                                                    placeholder="KEY"
                                                                    className="flex-1 px-3 py-2 bg-(--d-admin-surface-ground) border border-(--d-admin-surface-border) rounded-md text-(--d-admin-text-color) focus:outline-none focus:ring-2 focus:ring-(--d-admin-blue-500)"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={env.value}
                                                                    onChange={(e) => {
                                                                        const newEnvVars = [...envVars];
                                                                        newEnvVars[index].value = e.target.value;
                                                                        setEnvVars(newEnvVars);
                                                                    }}
                                                                    placeholder="Value"
                                                                    className="flex-1 px-3 py-2 bg-(--d-admin-surface-ground) border border-(--d-admin-surface-border) rounded-md text-(--d-admin-text-color) focus:outline-none focus:ring-2 focus:ring-(--d-admin-blue-500)"
                                                                />
                                                                <button
                                                                    onClick={() => {
                                                                        const newEnvVars = envVars.filter((_, i) => i !== index);
                                                                        setEnvVars(newEnvVars);
                                                                    }}
                                                                    className="px-3 py-2 bg-(--d-admin-surface-ground) border border-(--d-admin-surface-border) rounded-md text-(--d-admin-red-600) hover:bg-(--d-admin-surface-hover) transition-colors"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        {envVars.length === 0 && (
                                                            <p className="text-sm text-gray-500">No environment variables added.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleDeploy}
                                        disabled={!projectName || isDeploying || !hasContent}
                                        className="w-full px-4 py-3 bg-(--d-admin-blue-600) text-(--d-admin-text-color) rounded-md font-medium hover:bg-(--d-admin-blue-700) disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                    >
                                        {isDeploying ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                Deploying...
                                            </>
                                        ) : (
                                            <>
                                                <Rocket className="h-5 w-5" />
                                                Deploy to Vercel
                                            </>
                                        )}
                                    </button>

                                    {!hasContent && (
                                        <p className="text-sm text-(--d-admin-orange-500) text-center">
                                            No content found. Please create a page in the builder first.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {deploymentStatus === 'deploying' && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="mb-8 relative">
                                <div className="w-20 h-20 rounded-full bg-(--d-admin-blue-50) flex items-center justify-center">
                                    <Loader2 className="h-10 w-10 text-(--d-admin-blue-600) animate-spin" />
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-(--d-admin-text-color) mb-2">Deploying to Vercel</h2>
                            <p className="text-(--d-admin-text-color-secondary) mb-8">Please wait while we build and deploy your application.</p>

                            <div className="w-full max-w-md space-y-4 mb-6">
                                {DEPLOYMENT_STEPS.map((step) => (
                                    <div key={step.id} className="flex items-center gap-3">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep > step.id
                                                ? 'bg-(--d-admin-green-500)'
                                                : currentStep === step.id
                                                    ? 'bg-(--d-admin-blue-600)'
                                                    : 'bg-(--d-admin-surface-border)'
                                                }`}
                                        >
                                            {currentStep > step.id && <CheckCircle2 className="h-5 w-5 text-(--d-admin-surface-ground)" />}
                                            {currentStep === step.id && <div className="w-3 h-3 bg-(--d-admin-surface-ground) rounded-full animate-pulse" />}
                                        </div>
                                        <span
                                            className={`text-sm ${currentStep >= step.id ? 'text-(--d-admin-text-color) font-medium' : 'text-(--d-admin-text-color-secondary)'
                                                }`}
                                        >
                                            {step.label}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="w-full max-w-md">
                                <div className="h-2 w-full bg-(--d-admin-surface-border) rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-(--d-admin-blue-600) transition-all duration-300 ease-out"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {deploymentStatus === 'success' && (
                        <div className="py-8">
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-(--d-admin-surface-d) mb-4">
                                    <CheckCircle2 className="h-8 w-8 text-(--d-admin-green-500)" />
                                </div>
                                <h2 className="text-3xl font-bold text-(--d-admin-text-color) mb-2">Deployment Successful!</h2>
                                <p className="text-(--d-admin-text-color-secondary)">Your page is now live on Vercel.</p>
                            </div>

                            <div className="bg-(--d-admin-surface-card) rounded-lg border border-(--d-admin-surface-border) p-6 mb-6">
                                <h3 className="text-lg font-semibold text-(--d-admin-text-color) mb-4">Deployment Details</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-(--d-admin-text-color-secondary) mb-1">Deployment URL</label>
                                        <a
                                            href={deploymentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-(--d-admin-blue-600) hover:underline flex items-center gap-2"
                                        >
                                            {deploymentUrl.replace('https://', '')}
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-(--d-admin-text-color-secondary) mb-1">Status</label>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-(--d-admin-green-500) rounded-full" />
                                                <span className="text-(--d-admin-text-color)">Ready</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-(--d-admin-text-color-secondary) mb-1">Created</label>
                                            <div className="text-(--d-admin-text-color)">Just now</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <a
                                    href={deploymentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 px-4 py-3 bg-blue-600 text-(--d-admin-text-color) rounded-md font-medium hover:bg-blue-700 transition-colors text-center"
                                >
                                    Visit Website
                                </a>
                                <button
                                    onClick={() => {
                                        setDeploymentStatus('idle');
                                        setDeploymentUrl('');
                                    }}
                                    className="flex-1 px-4 py-3 bg-(--d-admin-surface-ground) border border-(--d-admin-surface-border) text-(--d-admin-text-color) rounded-md font-medium hover:bg-(--d-admin-surface-hover) transition-colors"
                                >
                                    Deploy Another
                                </button>
                            </div>
                        </div>
                    )}

                    {deploymentStatus === 'error' && (
                        <div className="py-8">
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-(--d-admin-red-50) mb-4">
                                    <XCircle className="h-8 w-8 text-(--d-admin-red-600)" />
                                </div>
                                <h2 className="text-3xl font-bold text-(--d-admin-text-color) mb-2">Deployment Failed</h2>
                                <p className="text-(--d-admin-text-color-secondary)">We encountered an error while deploying your page.</p>
                            </div>

                            {errorMessage && (
                                <div className="bg-(--d-admin-red-50) border border-(--d-admin-red-500) rounded-lg p-4 mb-6">
                                    <p className="text-(--d-admin-red-600) text-sm">{errorMessage}</p>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        setDeploymentStatus('idle');
                                        setErrorMessage('');
                                    }}
                                    className="flex-1 px-4 py-3 bg-(--d-admin-red-600) text-(--d-admin-text-color) rounded-md font-medium hover:bg-(--d-admin-red-500) transition-colors"
                                >
                                    Try Again
                                </button>
                                <button
                                    onClick={() => {
                                        setDeploymentStatus('idle');
                                        setErrorMessage('');
                                    }}
                                    className="flex-1 px-4 py-3 bg-(--d-admin-surface-ground) border border-(--d-admin-surface-border) text-(--d-admin-text-color) rounded-md font-medium hover:bg-(--d-admin-surface-hover) transition-colors"
                                >
                                    Back to Configuration
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
