import { Order } from '../types.ts';

interface SendOrderEmailResponse {
  success: boolean;
  message?: string;
  previewUrl?: string;
  error?: string;
}

/**
 * Sends an automated order confirmation email to the customer via backend API.
 */
export const sendOrderConfirmationEmail = async (
  order: Order,
  customerEmail: string
): Promise<SendOrderEmailResponse> => {
  try {
    const response = await fetch('/api/send-order-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order,
        customerEmail,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to send confirmation email');
    }

    return {
      success: true,
      message: data.message || 'Order confirmation email sent successfully!',
      previewUrl: data.previewUrl,
    };
  } catch (error: any) {
    console.warn('Email dispatch notice:', error.message || error);
    return {
      success: false,
      error: error.message || 'Email delivery endpoint unavailable',
    };
  }
};
