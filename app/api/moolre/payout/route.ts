import { NextResponse } from 'next/server';

/**
 * Stub for Moolre Payout API
 *
 * In a real implementation, this would:
 * 1. Validate the shopper's session and identity.
 * 2. Check if the chat session is eligible for withdrawal (escrow_released = true).
 * 3. Call Moolre API to initiate the payout.
 * 4. Update the chat state or log the transaction.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, amount, riderId } = body;

    console.log(`[Moolre Payout Stub] Initiating payout of GHS ${amount} for rider ${riderId} in session ${sessionId}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate successful payout
    return NextResponse.json({
      success: true,
      transactionId: `moolre_tx_${Math.random().toString(36).substring(7)}`,
      message: 'Payout successful',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Moolre Payout Stub] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
