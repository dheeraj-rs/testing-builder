'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { workbenchStore } from '@/app/(builder)/website-builder/lib/stores/workbench';
import { extractFilesForDeployment, validateDeploymentFiles } from '@/app/(builder)/website-builder/lib/utils/extractFiles';
import { Rocket, Loader2, CheckCircle2, XCircle, ExternalLink, GitBranch, Terminal, ChevronDown, Plus, Trash2 } from 'lucide-react';

const DEPLOYMENT_STEPS = [
    { id: 1, label: 'Initiating deployment...', duration: 1000 },
    { id: 2, label: 'Building project files...', duration: 2000 },
    { id: 3, label: 'Optimizing assets...', duration: 1500 },
    { id: 4, label: 'Uploading to Vercel...', duration: 2000 },
    { id: 5, label: 'Finalizing deployment...', duration: 1000 },
];

export default function PublishView() {
    const files = useStore(workbenchStore.files);

    const [projectName, setProjectName] = useState('');
    const [isDeploying, setIsDeploying] = useState(false);
    const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle');
    const [deploymentUrl, setDeploymentUrl] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Advanced Configuration State
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [framework, setFramework] = useState('other');
    const [rootDirectory, setRootDirectory] = useState('');
    const [buildCommand, setBuildCommand] = useState('');
    const [outputDirectory, setOutputDirectory] = useState('');
    const [installCommand, setInstallCommand] = useState('');
    const [envVars, setEnvVars] = useState<{ key: string; value: string }[]>([]);

    // Loading state
    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);

    // Generate unique project name on mount
    useEffect(() => {
        const uniqueSuffix = Math.random().toString(36).substring(2, 7);
        setProjectName(`my-website-${uniqueSuffix}`);
    }, []);

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
        if (!projectName) return;

        setIsDeploying(true);
        setDeploymentStatus('deploying');
        setErrorMessage('');
        setCurrentStep(0);
        setProgress(0);

        try {
            // Extract files from WebContainer
            const deploymentFiles = extractFilesForDeployment(files);

            // Validate files
            const validation = validateDeploymentFiles(deploymentFiles);
            if (!validation.valid) {
                throw new Error(validation.error);
            }

            const response = await fetch('/api/deploy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    projectName,
                    files: deploymentFiles,
                    framework: showAdvanced && framework !== 'other' ? framework : null,
                    rootDirectory: showAdvanced ? rootDirectory : null,
                    buildCommand: showAdvanced ? buildCommand : null,
                    outputDirectory: showAdvanced ? outputDirectory : null,
                    installCommand: showAdvanced ? installCommand : null,
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

    const fileCount = Object.keys(files).filter(path => files[path]?.type !== 'folder').length;

    return (
        <div className="flex flex-col h-full bg-surface-primary overflow-auto">
            <div className="max-w-4xl mx-auto w-full p-8">
                {deploymentStatus === 'idle' && (
                    <>
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-2">
                                <Rocket className="h-8 w-8 text-primary" />
                                <h1 className="text-3xl font-bold text-primary">Deploy to Vercel</h1>
                            </div>
                            <p className="text-secondary">
                                Deploy your website to a global edge network with a single click.
                            </p>
                        </div>

                        <div className="bg-surface-secondary rounded-lg border border-border p-6 mb-6">
                            <h2 className="text-xl font-semibold text-primary mb-4">Deployment Configuration</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-primary mb-2">
                                        Project Name
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={projectName}
                                            onChange={(e) => setProjectName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                                            placeholder="my-awesome-website"
                                            className="flex-1 px-3 py-2 bg-surface-primary border border-border rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                        <div className="px-3 py-2 bg-surface-tertiary border border-border rounded-md text-secondary">
                                            .vercel.app
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-primary mb-2">
                                        Project Stats
                                    </label>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-surface-primary border border-border rounded-lg p-4 text-center">
                                            <div className="text-2xl font-bold text-blue-500">{fileCount}</div>
                                            <div className="text-sm text-secondary">Files</div>
                                        </div>
                                        <div className="bg-surface-primary border border-border rounded-lg p-4 text-center">
                                            <div className="text-2xl font-bold text-green-500">
                                                {Object.keys(files).filter(p => p.endsWith('.html')).length}
                                            </div>
                                            <div className="text-sm text-secondary">HTML</div>
                                        </div>
                                        <div className="bg-surface-primary border border-border rounded-lg p-4 text-center">
                                            <div className="text-2xl font-bold text-purple-500">
                                                {Object.keys(files).filter(p => p.endsWith('.css') || p.endsWith('.scss')).length}
                                            </div>
                                            <div className="text-sm text-secondary">CSS</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-border pt-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={showAdvanced}
                                            onClick={() => setShowAdvanced(!showAdvanced)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showAdvanced ? 'bg-primary' : 'bg-surface-tertiary'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full transition-transform ${showAdvanced ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>
                                        <label className="text-sm font-medium text-primary cursor-pointer" onClick={() => setShowAdvanced(!showAdvanced)}>
                                            Enable Advanced Configuration
                                        </label>
                                    </div>

                                    {showAdvanced && (
                                        <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                                            <div>
                                                <label className="block text-sm font-medium text-primary mb-2">
                                                    Framework Preset
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        value={framework}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            setFramework(value);
                                                            switch (value) {
                                                                case 'nextjs':
                                                                    setBuildCommand('next build');
                                                                    setOutputDirectory('.next');
                                                                    setInstallCommand('npm install');
                                                                    break;
                                                                case 'vite':
                                                                    setBuildCommand('vite build');
                                                                    setOutputDirectory('dist');
                                                                    setInstallCommand('npm install');
                                                                    break;
                                                                default:
                                                                    setBuildCommand('');
                                                                    setOutputDirectory('');
                                                                    setInstallCommand('');
                                                            }
                                                        }}
                                                        className="w-full px-3 py-2 bg-surface-primary border border-border rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                                                    >
                                                        <option value="html">HTML (Static)</option>
                                                        <option value="nextjs">Next.js</option>
                                                        <option value="vite">Vite</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary pointer-events-none" />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-primary mb-2">
                                                    Build Command
                                                </label>
                                                <input
                                                    type="text"
                                                    value={buildCommand}
                                                    onChange={(e) => setBuildCommand(e.target.value)}
                                                    placeholder="npm run build"
                                                    className="w-full px-3 py-2 bg-surface-primary border border-border rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-primary mb-2">
                                                    Output Directory
                                                </label>
                                                <input
                                                    type="text"
                                                    value={outputDirectory}
                                                    onChange={(e) => setOutputDirectory(e.target.value)}
                                                    placeholder="dist"
                                                    className="w-full px-3 py-2 bg-surface-primary border border-border rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            </div>

                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="block text-sm font-medium text-primary">
                                                        Environment Variables
                                                    </label>
                                                    <button
                                                        onClick={() => setEnvVars([...envVars, { key: '', value: '' }])}
                                                        className="flex items-center gap-1 px-2 py-1 text-sm bg-surface-primary border border-border rounded-md text-primary hover:bg-surface-tertiary transition-colors"
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
                                                                className="flex-1 px-3 py-2 bg-surface-primary border border-border rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-primary"
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
                                                                className="flex-1 px-3 py-2 bg-surface-primary border border-border rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    const newEnvVars = envVars.filter((_, i) => i !== index);
                                                                    setEnvVars(newEnvVars);
                                                                }}
                                                                className="px-3 py-2 bg-surface-primary border border-border rounded-md text-error hover:bg-surface-tertiary transition-colors"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {envVars.length === 0 && (
                                                        <p className="text-sm text-secondary">No environment variables added.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleDeploy}
                                    disabled={!projectName || isDeploying || fileCount === 0}
                                    className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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

                                {fileCount === 0 && (
                                    <p className="text-sm text-warning text-center">
                                        No files found. Please generate a website first using the chat.
                                    </p>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {deploymentStatus === 'deploying' && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="mb-8 relative">
                            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-primary mb-2">Deploying to Vercel</h2>
                        <p className="text-secondary mb-8">Please wait while we build and deploy your application.</p>

                        <div className="w-full max-w-md space-y-4 mb-6">
                            {DEPLOYMENT_STEPS.map((step) => (
                                <div key={step.id} className="flex items-center gap-3">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep > step.id
                                            ? 'bg-green-500'
                                            : currentStep === step.id
                                                ? 'bg-primary'
                                                : 'bg-surface-tertiary'
                                            }`}
                                    >
                                        {currentStep > step.id && <CheckCircle2 className="h-5 w-5" />}
                                        {currentStep === step.id && <div className="w-3 h-3 rounded-full animate-pulse" />}
                                    </div>
                                    <span
                                        className={`text-sm ${currentStep >= step.id ? 'text-primary font-medium' : 'text-secondary'
                                            }`}
                                    >
                                        {step.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="w-full max-w-md">
                            <div className="h-2 w-full bg-surface-tertiary rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {deploymentStatus === 'success' && (
                    <div className="py-8">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                                <CheckCircle2 className="h-8 w-8 text-green-500" />
                            </div>
                            <h1 className="text-3xl font-bold text-primary mb-2">Deployment Successful!</h1>
                            <p className="text-secondary">Your website is now live on Vercel.</p>
                        </div>

                        <div className="bg-surface-secondary rounded-lg border border-border p-6 mb-6">
                            <h3 className="text-lg font-semibold text-primary mb-4">Deployment Details</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-1">Deployment URL</label>
                                    <a
                                        href={deploymentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline flex items-center gap-2"
                                    >
                                        {deploymentUrl.replace('https://', '')}
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-secondary mb-1">Status</label>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                                            <span className="text-primary">Ready</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-secondary mb-1">Created</label>
                                        <div className="text-primary">Just now</div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-1">Source</label>
                                    <div className="flex items-center gap-2 text-primary">
                                        <GitBranch className="h-4 w-4" />
                                        <span>main</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <a
                                href={deploymentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors text-center"
                            >
                                Visit Website
                            </a>
                            <button
                                onClick={() => {
                                    setDeploymentStatus('idle');
                                    setDeploymentUrl('');
                                }}
                                className="flex-1 px-4 py-3 bg-surface-secondary border border-border text-primary rounded-md font-medium hover:bg-surface-tertiary transition-colors"
                            >
                                Deploy Another
                            </button>
                        </div>

                        <div className="mt-6 bg-surface-secondary border border-border rounded-lg p-4 flex items-center gap-3 text-sm text-secondary">
                            <Terminal className="h-4 w-4" />
                            <span>To deploy to Production, run </span>
                            <code className="px-2 py-1 bg-surface-primary rounded text-primary">vercel --prod</code>
                            <span> via the CLI.</span>
                        </div>
                    </div>
                )}

                {deploymentStatus === 'error' && (
                    <div className="py-8">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
                                <XCircle className="h-8 w-8 text-red-500" />
                            </div>
                            <h1 className="text-3xl font-bold text-primary mb-2">Deployment Failed</h1>
                            <p className="text-secondary">We encountered an error while deploying your website.</p>
                        </div>

                        {errorMessage && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                                <p className="text-red-500 text-sm">{errorMessage}</p>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    setDeploymentStatus('idle');
                                    setErrorMessage('');
                                }}
                                className="flex-1 px-4 py-3 bg-red-500 text-[var(--d-admin-text-color)] rounded-md font-medium hover:bg-red-600 transition-colors"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => {
                                    setDeploymentStatus('idle');
                                    setErrorMessage('');
                                }}
                                className="flex-1 px-4 py-3 bg-surface-secondary border border-border text-primary rounded-md font-medium hover:bg-surface-tertiary transition-colors"
                            >
                                Back to Configuration
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
