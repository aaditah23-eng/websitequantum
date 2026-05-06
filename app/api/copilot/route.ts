import { NextRequest, NextResponse } from 'next/server';
import { runCopilotScan } from '@/lib/copilot';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const repoUrl = body.repoUrl || body.url || '';

    if (!repoUrl) {
      return NextResponse.json(
        { error: 'GitHub repository URL is required.' },
        { status: 400 }
      );
    }

    const result = await runCopilotScan(repoUrl);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Developer copilot scan failed.',
      },
      { status: 400 }
    );
  }
}
