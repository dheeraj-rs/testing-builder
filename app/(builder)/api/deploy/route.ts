import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectName,
      files, // Array of { path: string, content: string }
      framework,
      rootDirectory,
      buildCommand,
      outputDirectory,
      installCommand,
      envVars,
    } = body;

    const vercelToken = process.env.VERCEL_TOKEN;

    if (!vercelToken) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Vercel token not configured. Please add VERCEL_TOKEN to your environment variables.',
        },
        { status: 500 }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            'No files provided for deployment. Please generate a website first.',
        },
        { status: 400 }
      );
    }

    console.log('🚀 Starting Vercel deployment...');
    console.log('📝 Project name:', projectName);
    console.log('📁 Files to deploy:', files.length);
    console.log('📄 File paths:', files.map((f: any) => f.path).join(', '));

    // Format files for Vercel API
    const vercelFiles = files.map(
      (file: { path: string; content: string }) => ({
        file: file.path,
        data: Buffer.from(file.content).toString('base64'),
        encoding: 'base64',
      })
    );

    const deploymentPayload: any = {
      name: projectName,
      files: vercelFiles,
      projectSettings: {
        framework: framework || null,
        rootDirectory: rootDirectory || null,
        buildCommand: buildCommand || null,
        outputDirectory: outputDirectory || null,
        installCommand: installCommand || null,
      },
      target: 'production',
    };

    // Add environment variables if provided
    if (envVars && Array.isArray(envVars) && envVars.length > 0) {
      const envObj: Record<string, string> = {};
      envVars.forEach((e: any) => {
        if (e.key && e.value) {
          envObj[e.key] = e.value;
        }
      });
      deploymentPayload.env = envObj;
    }

    const deploymentResponse = await fetch(
      'https://api.vercel.com/v13/deployments',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deploymentPayload),
      }
    );

    if (!deploymentResponse.ok) {
      const errorData = await deploymentResponse.json();
      console.error('Vercel API Error:', errorData);

      return NextResponse.json(
        {
          success: false,
          error: errorData.error?.message || 'Failed to deploy to Vercel',
        },
        { status: deploymentResponse.status }
      );
    }

    const deploymentData = await deploymentResponse.json();

    console.log(
      '✅ Vercel API Response:',
      JSON.stringify(deploymentData, null, 2)
    );

    // Prefer the alias (production URL) if available, otherwise use the deployment URL
    let deploymentUrl = `https://${deploymentData.url}`;
    if (deploymentData.alias && deploymentData.alias.length > 0) {
      deploymentUrl = `https://${deploymentData.alias[0]}`;
    }

    console.log('🚀 Deployment successful!');
    console.log('📦 Deployment ID:', deploymentData.id);
    console.log('🌐 Deployment URL:', deploymentUrl);

    return NextResponse.json({
      success: true,
      deploymentId: deploymentData.id,
      teamId: deploymentData.team?.id,
      url: deploymentUrl,
    });
  } catch (error: any) {
    console.error('Deployment error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
