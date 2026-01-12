import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const deploymentId = searchParams.get('id');

    if (!deploymentId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Deployment ID is required',
        },
        { status: 400 }
      );
    }

    const vercelToken = process.env.VERCEL_TOKEN;

    if (!vercelToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Vercel token not configured',
        },
        { status: 500 }
      );
    }

    const teamId = searchParams.get('teamId');
    const url = teamId
      ? `https://api.vercel.com/v13/deployments/${deploymentId}?teamId=${teamId}`
      : `https://api.vercel.com/v13/deployments/${deploymentId}`;

    const statusResponse = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${vercelToken}`,
      },
    });

    if (!statusResponse.ok) {
      const errorData = await statusResponse.json();
      console.error('Vercel Status API Error:', errorData);

      return NextResponse.json(
        {
          success: false,
          error:
            errorData.error?.message || 'Failed to fetch deployment status',
        },
        { status: statusResponse.status }
      );
    }

    const statusData = await statusResponse.json();

    // Get the deployment URL
    let deploymentUrl = `https://${statusData.url}`;
    if (statusData.alias && statusData.alias.length > 0) {
      deploymentUrl = `https://${statusData.alias[0]}`;
    }

    return NextResponse.json({
      success: true,
      status: statusData.readyState || statusData.state, // Vercel uses 'readyState'
      url: deploymentUrl,
    });
  } catch (error: any) {
    console.error('Status check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
