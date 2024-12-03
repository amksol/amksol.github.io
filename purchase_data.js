// Example of handling the redirect from Stripe with session_id
window.onload = async function () {
    // Step 1: Extract session_id from the URL (e.g., /success?session_id=cs_test_abc123)
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('checkout_session_id'); // Get the session_id from the URL

    if (sessionId) {
        try {
            // Step 2: Append the session_id to the Cloudflare Worker URL
            const workerUrl = `https://weathered-sky-4c4f.vatmarker.workers.dev?checkout_session_id=${sessionId}`;

            // Step 3: Make a request to your Cloudflare Worker
            const response = await fetch(workerUrl, {
                method: 'GET', // Use GET to pass session_id as a query parameter
                headers: {
                    'Content-Type': 'application/json',
                },
            });


            // Step 4: Handle the response from the Worker
            if (!response.ok) {
                throw new Error('Failed to retrieve session data from Worker');
            }

            const sessionData = await response.json();  // Parse the response as JSON
            console.log('Session Data:', sessionData);   // Log the session data for debugging
            
            // Store variables localStorage for cross-script access
            sessionStorage.setItem('transactionId', sessionData.transactionId);
            sessionStorage.setItem('totalAmount', sessionData.totalAmount);
            sessionStorage.setItem('currency', sessionData.currency);
            sessionStorage.setItem('customerEmail', sessionData.customer_email);

            // Step 5: Send the session data to Google Tag Manager (or other analytics tools)
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: 'purchase',
                transactionId: sessionData.transactionId,
                totalAmount: sessionData.totalAmount,
                currency: sessionData.currency,
                // optional email send, need consent customerEmail: sessionData.customer_email,
                //lineItems: sessionData.line_items,
            });

            // Send purchase data to Meta Pixel
            fbq('track', 'Purchase', {
                value: sessionData.totalAmount,
                currency: sessionData.currency,
                // optional email send, need consent email: sessionData.customer_email,
            });

        } catch (error) {
            console.error('Error fetching session data from Worker:', error);
        }
    } else {
        console.error('session_id not found in URL');
    }
};