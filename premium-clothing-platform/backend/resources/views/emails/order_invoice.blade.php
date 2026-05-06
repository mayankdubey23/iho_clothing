<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background-color: #1e3a8a; color: #ffffff; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; letter-spacing: 1px; }
        .content { padding: 30px 20px; color: #334155; }
        .order-details { background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th { text-align: left; padding: 10px; border-bottom: 2px solid #e2e8f0; color: #1e3a8a; }
        td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
        .total-row { font-weight: bold; font-size: 18px; color: #0f172a; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #64748b; background: #f8fafc; border-top: 1px solid #e2e8f0; }
        .btn { display: inline-block; padding: 10px 20px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>IHO CLOTHING</h1>
            <p style="margin-top: 5px; opacity: 0.8;">Premium Fashion Delivered</p>
        </div>
        
        <div class="content">
            <h2>Hi {{ $order->customer_name }},</h2>
            <p>Thank you for your purchase! We have received your payment and your order is now confirmed. Here are your invoice details:</p>
            
            <div class="order-details">
                <strong>Order ID:</strong> #{{ $order->id }}<br>
                <strong>Payment ID:</strong> {{ $order->razorpay_payment_id }}<br>
                <strong>Delivery Address:</strong> {{ $order->shipping_address }} (Pincode: {{ $order->pincode ?? 'N/A' }})
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($order->items as $item)
                    <tr>
                        <td>{{ $item->product->name ?? 'Premium Clothing Item' }}</td>
                        <td>{{ $item->quantity }}</td>
                        <td>₹{{ number_format($item->price, 2) }}</td>
                    </tr>
                    @endforeach
                    <tr class="total-row">
                        <td colspan="2" style="text-align: right; border-bottom: none;">Total Amount:</td>
                        <td style="border-bottom: none; color: #1e3a8a;">₹{{ number_format($order->total_amount, 2) }}</td>
                    </tr>
                </tbody>
            </table>

            <p style="text-align: center;">
                <a href="#" class="btn">Track Your Order</a>
            </p>
        </div>

        <div class="footer">
            &copy; {{ date('Y') }} IHO Clothing. All rights reserved.<br>
            If you have any questions, reply to this email or contact our support.
        </div>
    </div>
</body>
</html>